<?php

namespace App\Contracts;

interface IdentityProvider
{
    public function authorizationUrl(string $state, string $nonce, string $codeChallenge): string;

    /** @return array{sub:string,email:string,name:string,picture:?string} */
    public function identityFromCode(string $code, string $codeVerifier, string $nonce): array;
}
