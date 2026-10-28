<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules\Password as PasswordRule;

class AuthController extends ApiController
{
    public function register(Request $request)
    {
        if (is_string($request->input('email'))) {
            $request->merge(['email' => strtolower(trim($request->input('email')))]);
        }
        $data = $request->validate(['name' => 'required|string|min:2|max:60', 'email' => 'required|email:rfc|max:254|unique:users,email', 'password' => $this->passwordRules()]);
        $data['email'] = strtolower($data['email']);
        try {
            $user = User::create($data);
        } catch (UniqueConstraintViolationException) {
            abort(422, 'E-mail já cadastrado.');
        }
        Auth::login($user);
        $request->session()->forget('google_session_version');
        $request->session()->regenerate();

        return $this->ok(['user' => $this->user($user)], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate(['email' => 'required|email:rfc|max:254', 'password' => 'required|string|max:128']);
        $user = User::where('email', strtolower($data['email']))->first();
        $valid = Hash::check($data['password'], $user?->password ?? config('gift.dummy_hash'));
        abort_unless($user && $valid && ! $user->deletion_requested_at, 401, 'E-mail ou senha incorretos.');
        Auth::login($user);
        $request->session()->forget('google_session_version');
        $request->session()->regenerate();

        return $this->ok(['user' => $this->user($user)]);
    }

    public function me(Request $request)
    {
        return $this->ok(['user' => $this->user($request->user())]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return $this->ok(['logged_out' => true]);
    }

    public function forgot(Request $request)
    {
        $data = $request->validate(['email' => 'required|email:rfc|max:254']);
        abort_if(app()->isProduction() && config('mail.default') === 'log', 503, 'Recuperação por e-mail não configurada.');
        // Keep unknown/inactive accounts inside the broker's timebox too.
        Password::sendResetLink(['email' => strtolower($data['email']), 'deletion_requested_at' => null, 'google_signin_disabled_at' => null]);

        return $this->ok(['message' => 'Se existir uma conta com esse e-mail, você receberá um link para redefinir a senha.']);
    }

    public function reset(Request $request)
    {
        if (is_string($request->input('email'))) {
            $request->merge(['email' => strtolower(trim($request->input('email')))]);
        }
        $data = $request->validate(['email' => 'required|email:rfc|max:254', 'token' => 'required|string|max:128', 'password' => $this->passwordRules()]);
        $result = DB::transaction(function () use ($data) {
            // Serialize token validation and consumption with account deletion and
            // concurrent resets. A failed token deletion must roll back the password.
            $account = User::where('email', $data['email'])->lockForUpdate()->first();
            if (! $account || $account->deletion_requested_at || $account->google_signin_disabled_at) {
                return Password::INVALID_TOKEN;
            }

            return Password::reset($data, function (User $user, string $password) {
                $user->forceFill(['password' => $password, 'remember_token' => null])->save();
                DB::table('sessions')->where('user_id', $user->id)->delete();
            });
        });
        abort_unless($result === Password::PASSWORD_RESET, 400, 'Link inválido ou expirado. Solicite outro.');

        return $this->ok(['message' => 'Senha alterada. Entre novamente com a nova senha.']);
    }

    private function passwordRules(): array
    {
        return ['bail', 'required', 'string', PasswordRule::min(8), 'max:128', function ($attribute, $value, $fail) {
            $normalized = mb_strtolower(trim($value));
            if (in_array($normalized, ['password', 'password123', '12345678', '123456789', '1234567890', 'qwerty123', 'senha123', 'senha1234'], true)
                || $normalized === mb_strtolower(trim((string) request('email')))
                || $normalized === mb_strtolower(trim((string) request('name')))) {
                $fail('Escolha uma senha menos previsível, diferente do seu nome e e-mail.');
            }
            if (str_contains($value, "\0")) {
                $fail('A senha contém um caractere inválido.');
            }
            if (config('hashing.driver') === 'bcrypt' && strlen($value) > 72) {
                $fail('A senha deve ter no máximo 72 bytes. Acentos e emojis ocupam mais de um byte.');
            }
        }];
    }

    private function user(User $user): array
    {
        return ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'role' => $user->role, 'avatar_url' => $user->google_avatar_url, 'created_at' => $user->created_at?->getTimestampMs()];
    }
}
