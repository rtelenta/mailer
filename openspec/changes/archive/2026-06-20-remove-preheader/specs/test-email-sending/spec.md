# Delta: test-email-sending

## Email Defaults

REMOVE `preheader` from the defaults passed to `sendEmail` when constructing the email envelope. The template's `preheader` field no longer exists, so no default or override for it is passed.
