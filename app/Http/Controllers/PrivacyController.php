<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\Refund;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PrivacyController extends ApiController
{
    public function export(Request $request)
    {
        $user = $request->user();
        $data = ['account' => $user->only(['id', 'name', 'email', 'google_avatar_url', 'created_at']),
            'purchases' => Purchase::withTrashed()->where('user_id', $user->id)->get()->makeHidden(['share_token']),
            'refunds' => Refund::where('user_id', $user->id)->get(), 'tickets' => Ticket::where('user_id', $user->id)->get()];
        $data['payments'] = DB::table('payment_checkouts as c')->join('purchases as p', 'p.id', '=', 'c.purchase_id')->where('p.user_id', $user->id)
            ->get(['c.id', 'c.purchase_id', 'c.provider', 'c.amount_cents', 'c.coupon', 'c.discount_percent', 'c.status', 'c.live', 'c.bank_reference', 'c.confirmed_at', 'c.created_at', 'c.updated_at']);
        $data['payment_receipts'] = DB::table('payment_receipts as r')->join('payment_checkouts as c', 'c.id', '=', 'r.checkout_id')->join('purchases as p', 'p.id', '=', 'c.purchase_id')->where('p.user_id', $user->id)
            ->get(['r.id', 'r.checkout_id', 'r.status', 'r.amount_cents', 'r.refunded_cents', 'r.created_at', 'r.updated_at']);

        return response()->json($data)->header('Content-Disposition', 'attachment; filename="meus-dados.json"');
    }

    public function destroy(Request $request)
    {
        $data = $request->validate(['password' => 'required|string|max:128']);
        $user = $request->user();
        DB::transaction(function () use ($user, $data) {
            $user = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            abort_unless(Hash::check($data['password'], $user->password), 422, 'Senha incorreta.');
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
