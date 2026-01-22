<?php

namespace App\Http\Controllers;

use App\Models\Poll;
use App\Models\PollOption;
use App\Models\PollVote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PollController extends Controller
{
    public function index(Request $request)
    {
        $query = Poll::with(['association', 'options'])->where('is_active', true);

        if ($request->has('association_id')) {
            $query->where('association_id', $request->association_id);
        }

        $polls = $query->orderByDesc('created_at')->get();

        return response()->json($polls);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'association_id' => 'required|exists:associations,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'allow_multiple_votes' => 'sometimes|boolean',
            'show_results_before_voting' => 'sometimes|boolean',
            'options' => 'required|array|min:2',
            'options.*' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $poll = DB::transaction(function () use ($request) {
            $poll = Poll::create(array_merge(
                $request->except('options'),
                ['created_by' => $request->user()->id]
            ));

            foreach ($request->options as $index => $optionText) {
                PollOption::create([
                    'poll_id' => $poll->id,
                    'option_text' => $optionText,
                    'order' => $index,
                ]);
            }

            return $poll;
        });

        return response()->json([
            'message' => 'Poll created successfully.',
            'data' => $poll->load('options')
        ], 201);
    }

    public function vote(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'option_id' => 'required|exists:poll_options,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $poll = Poll::with('options')->findOrFail($id);
        $user = $request->user();

        // Check if poll is active
        if (!$poll->is_active) {
            return response()->json(['message' => 'Poll is not active.'], 403);
        }

        // Check if poll has ended
        if ($poll->ends_at && now()->greaterThan($poll->ends_at)) {
            return response()->json(['message' => 'Poll has ended.'], 403);
        }

        // Check if user already voted
        $existingVote = PollVote::where('poll_id', $id)->where('user_id', $user->id)->first();

        if ($existingVote && !$poll->allow_multiple_votes) {
            return response()->json(['message' => 'You have already voted in this poll.'], 400);
        }

        DB::transaction(function () use ($id, $request, $user) {
            PollVote::create([
                'poll_id' => $id,
                'option_id' => $request->option_id,
                'user_id' => $user->id,
                'voted_at' => now(),
            ]);

            PollOption::where('id', $request->option_id)->increment('votes_count');
        });

        return response()->json(['message' => 'Vote recorded successfully.']);
    }

    public function results($id)
    {
        $poll = Poll::with('options')->findOrFail($id);
        $user = request()->user();

        // Check if user can see results
        if (!$poll->show_results_before_voting) {
            $hasVoted = PollVote::where('poll_id', $id)->where('user_id', $user->id)->exists();
            if (!$hasVoted) {
                return response()->json(['message' => 'You must vote before seeing results.'], 403);
            }
        }

        $totalVotes = $poll->options->sum('votes_count');

        $results = $poll->options->map(function ($option) use ($totalVotes) {
            return [
                'id' => $option->id,
                'option_text' => $option->option_text,
                'votes_count' => $option->votes_count,
                'percentage' => $totalVotes > 0 ? round(($option->votes_count / $totalVotes) * 100, 2) : 0,
            ];
        });

        return response()->json([
            'poll' => $poll,
            'total_votes' => $totalVotes,
            'results' => $results,
        ]);
    }

    public function close($id)
    {
        $poll = Poll::findOrFail($id);

        // Only creator or admin can close
        if ($poll->created_by !== request()->user()->id && !request()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $poll->update(['is_active' => false]);

        return response()->json(['message' => 'Poll closed successfully.']);
    }
}
