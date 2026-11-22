class AppError(Exception):
    status_code = 500
    code = "INTERNAL_ERROR"
    public_message = "An unexpected server error occurred."

    def __init__(self) -> None:
        super().__init__(self.public_message)


class IntegrationNotConfiguredError(AppError):
    status_code = 503
    code = "INTEGRATION_NOT_CONFIGURED"

    def __init__(self, integration: str) -> None:
        self.public_message = f"The {integration} integration is not configured."
        super().__init__()


class MarketApiKeyMissingError(AppError):
    status_code = 503
    code = "MARKET_API_KEY_MISSING"

    def __init__(self) -> None:
        self.public_message = "The data.gov.in API key is not configured."
        super().__init__()


class ProviderTimeoutError(AppError):
    status_code = 504
    code = "PROVIDER_TIMEOUT"

    def __init__(self, provider: str) -> None:
        self.public_message = f"The {provider} provider did not respond before the timeout."
        super().__init__()


class ProviderError(AppError):
    status_code = 502
    code = "PROVIDER_ERROR"

    def __init__(self, provider: str) -> None:
        self.public_message = f"The {provider} provider request failed."
        super().__init__()


class GeminiApiKeyMissingError(AppError):
    status_code = 503
    code = "GEMINI_API_KEY_MISSING"

    def __init__(self) -> None:
        self.public_message = "The Gemini API key is not configured."
        super().__init__()


class GeminiQuotaError(AppError):
    status_code = 429
    code = "GEMINI_QUOTA_EXHAUSTED"

    def __init__(self) -> None:
        self.public_message = "The AI provider quota is temporarily exhausted."
        super().__init__()


class GeminiAuthenticationError(AppError):
    status_code = 502
    code = "GEMINI_AUTHENTICATION_ERROR"

    def __init__(self) -> None:
        self.public_message = "The AI provider credentials could not be authenticated."
        super().__init__()


class GeminiOutputError(AppError):
    status_code = 502
    code = "GEMINI_INVALID_OUTPUT"

    def __init__(self) -> None:
        self.public_message = "The AI provider returned invalid structured output."
        super().__init__()


class EmbeddingProviderError(AppError):
    status_code = 502
    code = "EMBEDDING_PROVIDER_ERROR"

    def __init__(self) -> None:
        self.public_message = "The embedding provider request failed."
        super().__init__()


class InsufficientEvidenceError(AppError):
    status_code = 404
    code = "INSUFFICIENT_EVIDENCE"

    def __init__(self) -> None:
        self.public_message = "The knowledge base has insufficient relevant evidence."
        super().__init__()
