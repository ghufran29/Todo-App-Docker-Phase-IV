from datetime import timedelta
import os


class AuthConfig:
    """Configuration class for authentication settings"""

    # Secret key for JWT tokens
    SECRET_KEY = os.getenv("BETTER_AUTH_SECRET", "fallback-test-secret-key-change-in-production")

    # Algorithm used for JWT encoding/decoding
    ALGORITHM = "HS256"

    # Access token expiration time (in minutes)
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRATION_TIME", "3600"))  # 1 hour default

    # Refresh token expiration time (in days)
    REFRESH_TOKEN_EXPIRE_DAYS = 7

    @classmethod
    def get_access_token_expire_delta(cls):
        """Get timedelta for access token expiration"""
        return timedelta(minutes=cls.ACCESS_TOKEN_EXPIRE_MINUTES)

    @classmethod
    def get_refresh_token_expire_delta(cls):
        """Get timedelta for refresh token expiration"""
        return timedelta(days=cls.REFRESH_TOKEN_EXPIRE_DAYS)


# Global instance of AuthConfig
auth_config = AuthConfig()