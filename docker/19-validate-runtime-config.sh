#!/bin/sh
set -eu

value="${PUBLIC_API_BASE_URL:-}"
if [ "${#value}" -gt 2048 ] || ! printf '%s' "$value" |
    grep -Eq '^(https://[A-Za-z0-9.-]+(:[0-9]{1,5})?|http://(localhost|127\.0\.0\.1)(:[0-9]{1,5})?)(/[-A-Za-z0-9._~%!$&()*+,;=:@/]*)?$'; then
    echo "PUBLIC_API_BASE_URL is invalid" >&2
    exit 1
fi

mkdir -p /tmp/runtime-config
