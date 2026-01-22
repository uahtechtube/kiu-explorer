<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Like;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SocialController extends Controller
{
    public function index(Request $request)
    {
        $query = Post::with(['user:id,surname,first_name', 'association:id,name', 'comments.user:id,surname,first_name'])
            ->withCount(['likes', 'comments']);

        if ($request->has('association_id')) {
            $query->where('association_id', $request->association_id);
        }

        return response()->json($query->latest()->paginate(15));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
            'association_id' => 'nullable|exists:associations,id',
            'type' => 'required|in:social,news',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $post = $request->user()->posts()->create($request->all());

        return response()->json($post->load('user'), 201);
    }

    public function like(Request $request, $id)
    {
        $user = $request->user();
        $like = Like::firstOrCreate([
            'post_id' => $id,
            'user_id' => $user->id,
        ]);

        return response()->json(['message' => 'Post liked', 'like' => $like]);
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
}
