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
