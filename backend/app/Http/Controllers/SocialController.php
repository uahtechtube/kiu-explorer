<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Like;
use App\Models\Comment;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class SocialController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // 1. Determine user's department to handle "class" visibility
        $departmentId = null;
        if ($user->isStudent() && $user->studentProfile) {
            $departmentId = $user->studentProfile->department_id;
        } elseif ($user->isLecturer() && $user->lecturerProfile) {
            $departmentId = $user->lecturerProfile->department_id;
        }

        // 2. Fetch all association memberships for "association" visibility
        $associationIds = DB::table('association_members')
            ->where('user_id', $user->id)
            ->pluck('association_id')
            ->toArray();

        // 3. Build Post Query
        $query = Post::with([
            'user:id,surname,first_name,passport_photograph', 
            'user.studentProfile:id,user_id,department_id',
            'user.lecturerProfile:id,user_id,department_id',
            'association:id,name', 
            'comments.user:id,surname,first_name,passport_photograph'
        ])->withCount(['likes', 'comments']);

        // 4. If request specifies user_id or association_id, narrow query first
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('association_id')) {
            $query->where('association_id', $request->association_id);
        }

        // Filter by tab visibility if specified
        if ($request->has('tab') && in_array($request->tab, ['school', 'class', 'association'])) {
            $query->where('visibility', $request->tab);
        }

        // 5. Apply visibility filters (unless user is an admin)
        if (!$user->isAdmin()) {
            $query->where(function ($q) use ($user, $departmentId, $associationIds) {
                // Public/school wide posts
                $q->where('visibility', 'school')
                  // Class/department specific posts
                  ->orWhere(function ($q2) use ($departmentId) {
                      $q2->where('visibility', 'class')
                         ->where(function ($q3) use ($departmentId) {
                             $q3->whereHas('user.studentProfile', function ($q4) use ($departmentId) {
                                 $q4->where('department_id', $departmentId);
                             })
                             ->orWhereHas('user.lecturerProfile', function ($q4) use ($departmentId) {
                                 $q4->where('department_id', $departmentId);
                             });
                         });
                  })
                  // Association specific posts
                  ->orWhere(function ($q2) use ($user, $associationIds) {
                      $q2->where('visibility', 'association')
                         ->where(function ($q3) use ($user, $associationIds) {
                             $q3->whereIn('association_id', $associationIds)
                                ->orWhere('user_id', $user->id);
                         });
                  });
            });
        }

        // 6. Handle tab feeds: standard vs. trending
        if ($request->get('tab') === 'trending') {
            // Formula for trending: likes + comments * 2
            $query->orderBy(DB::raw('(likes_count + (comments_count * 2))'), 'desc');
        } else {
            $query->latest();
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
            'association_id' => 'nullable|exists:associations,id',
            'type' => 'required|in:social,news',
            'visibility' => 'nullable|in:school,class,association',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->all();
        
        // Ensure association post has association_id
        if (isset($data['visibility']) && $data['visibility'] === 'association' && empty($data['association_id'])) {
            return response()->json(['association_id' => ['An association must be selected when visibility is set to association.']], 422);
        }

        $post = $request->user()->posts()->create($data);

        return response()->json($post->load('user'), 201);
    }

    public function update(Request $request, $id)
    {
        $post = Post::findOrFail($id);
        if ($post->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
            'visibility' => 'nullable|in:school,class,association',
            'association_id' => 'nullable|exists:associations,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->all();
        if (isset($data['visibility']) && $data['visibility'] === 'association' && empty($data['association_id']) && empty($post->association_id)) {
            return response()->json(['association_id' => ['An association must be selected when visibility is set to association.']], 422);
        }

        $post->update($request->only(['content', 'visibility', 'association_id']));

        return response()->json(['message' => 'Post updated successfully', 'post' => $post->load('user')]);
    }

    public function destroy(Request $request, $id)
    {
        $post = Post::findOrFail($id);
        if ($post->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }

    public function like(Request $request, $id)
    {
        $user = $request->user();
        
        // Toggle like if it already exists
        $existingLike = Like::where('post_id', $id)->where('user_id', $user->id)->first();
        if ($existingLike) {
            $existingLike->delete();
            return response()->json(['message' => 'Post unliked', 'liked' => false]);
        }

        $like = Like::create([
            'post_id' => $id,
            'user_id' => $user->id,
        ]);

        return response()->json(['message' => 'Post liked', 'liked' => true, 'like' => $like]);
    }

    public function comment(Request $request, $id)
    {
        $request->validate(['content' => 'required|string']);

        $comment = Comment::create([
            'post_id' => $id,
            'user_id' => $request->user()->id,
            'content' => $request->content,
        ]);

        return response()->json(['message' => 'Comment added', 'comment' => $comment->load('user')]);
    }

    public function report(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $post = Post::findOrFail($id);

        $report = Report::create([
            'reportable_type' => Post::class,
            'reportable_id' => $post->id,
            'reporter_id' => $request->user()->id,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Post reported successfully', 'report' => $report]);
    }
}
