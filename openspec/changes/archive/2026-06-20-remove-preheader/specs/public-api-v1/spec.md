# Delta: public-api-v1

## POST /v1/send — Request Body

REMOVE `preheader` as an optional field from the send request schema. Callers who pass `preheader` will have the field silently ignored (standard unknown-key behavior) or receive a validation error if strict mode is enabled.

## Send Override Behavior

REMOVE the `preheader` override — callers can no longer override the template preheader at send time because the field no longer exists.
