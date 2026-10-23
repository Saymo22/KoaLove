<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\Refund;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PrivacyController extends ApiController
{
    public function export(Request $request)
    {
        $user = $request->user();
        $data = ['account' => $user->only(['id', 'name', 'email', 'created_at']),
            'purchases' => Purchase::withTrashed()->where('user_id', $user->id)->get()->makeHidden(['share_token']),
            'refunds' => Refund::where('user_id', $user->id)->get(), 'tickets' => Ticket::where('user_id', $user->id)->get()];

        return response()->json($data)->header('Content-Disposition', 'attachment; filename="meus-dados.json"');
    }

    public function destroy(Request $request)
    {
        $data = $request->validate(['password' => 'required|string|max:128']);
        $user = $request->user();
        abort_unless(Hash::check($data['password'], $user->password), 422, 'Senha incorreta.');
        DB::transaction(function () use ($user) {
            $user->forceFill(['deletion_requested_at' => now(), 'remember_token' => null])->save();
            Purchase::where('user_id', $user->id)->delete();
            DB::table('sessions')->where('user_id', $user->id)->delete();
            DB::table('password_reset_tokens')->where('email', $user->email)->delete();
        });
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return $this->ok(['message' => 'Conta desativada. Os dados serão eliminados em até 30 dias.']);
    }
}
