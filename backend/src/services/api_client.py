from typing import Optional, Dict, Any
import httpx
from fastapi import HTTPException, status
from fastapi import HTTPException, status
import os
import uuid


class ApiClient:
    """Centralized API client with automatic JWT token handling"""

    def __init__(self, base_url: Optional[str] = None):
        """
        Initialize the API client with base URL and configuration.

        Args:
            base_url: Base URL for API requests. If None, uses environment variable or default
        """
        self.base_url = base_url or os.getenv("API_BASE_URL", "http://localhost:8000")
        self.http_client = httpx.AsyncClient(timeout=30.0)  # 30 second timeout
        self._token: Optional[str] = None

    async def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
        headers: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Make an HTTP request with proper headers and authentication.

        Args:
            method: HTTP method (GET, POST, PUT, DELETE, etc.)
            endpoint: API endpoint path
            data: Request body data (for POST/PUT/PATCH)
            params: Query parameters
            headers: Additional headers to include

        Returns:
            Response data as dictionary
        """
        url = f"{self.base_url}/{endpoint.lstrip('/')}"

        # Prepare headers
        request_headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        # Add authentication header if token is available
        if self._token:
            request_headers["Authorization"] = f"Bearer {self._token}"

        # Include any additional headers
        if headers:
            request_headers.update(headers)

        try:
            response = await self.http_client.request(
                method=method,
                url=url,
                json=data,
                params=params,
                headers=request_headers
            )

            # Raise HTTP exception for bad status codes
            if response.status_code >= 400:
                if response.status_code == 401:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Unauthorized: Please log in again"
                    )
                elif response.status_code == 403:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access forbidden: Insufficient permissions"
                    )
                else:
                    # Try to get error details from response
                    try:
                        error_data = response.json()
                        detail = error_data.get("detail", f"HTTP {response.status_code} error")
                    except:
                        detail = f"HTTP {response.status_code} error"

                    raise HTTPException(
                        status_code=response.status_code,
                        detail=detail
                    )

            # Return JSON response
            return response.json()

        except httpx.RequestError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Network error occurred while making request: {str(e)}"
            )
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Request timed out"
            )

    def set_token(self, token: str) -> None:
        """
        Set the authentication token for subsequent requests.

        Args:
            token: JWT token string to use for authentication
        """
        self._token = token

    def clear_token(self) -> None:
        """Clear the stored authentication token."""
        self._token = None

    async def get(self, endpoint: str, params: Optional[Dict] = None, headers: Optional[Dict] = None) -> Dict[str, Any]:
        """Make a GET request."""
        return await self._make_request("GET", endpoint, params=params, headers=headers)

    async def post(self, endpoint: str, data: Optional[Dict] = None, headers: Optional[Dict] = None) -> Dict[str, Any]:
        """Make a POST request."""
        return await self._make_request("POST", endpoint, data=data, headers=headers)

    async def put(self, endpoint: str, data: Optional[Dict] = None, headers: Optional[Dict] = None) -> Dict[str, Any]:
        """Make a PUT request."""
        return await self._make_request("PUT", endpoint, data=data, headers=headers)

    async def patch(self, endpoint: str, data: Optional[Dict] = None, headers: Optional[Dict] = None) -> Dict[str, Any]:
        """Make a PATCH request."""
        return await self._make_request("PATCH", endpoint, data=data, headers=headers)

    async def delete(self, endpoint: str, headers: Optional[Dict] = None) -> Dict[str, Any]:
        """Make a DELETE request."""
        return await self._make_request("DELETE", endpoint, headers=headers)

    async def close(self) -> None:
        """Close the HTTP client connection."""
        await self.http_client.aclose()

    def __del__(self):
        """Cleanup on deletion."""
        try:
            # Try to close the client if it's still open
            import asyncio
            if not self.http_client.is_closed:
                if hasattr(asyncio, 'get_running_loop'):
                    try:
                        loop = asyncio.get_running_loop()
                        if loop.is_running():
                            # If event loop is running, schedule cleanup for later
                            if not loop.is_closed:
                                loop.call_soon_threadsafe(lambda: asyncio.create_task(self.http_client.aclose()))
                        else:
                            # If event loop is not running, we can close directly
                            asyncio.run(self.http_client.aclose())
                    except RuntimeError:
                        # If no event loop is running, use asyncio.run
                        asyncio.run(self.http_client.aclose())
                else:
                    # Fallback to older method
                    asyncio.run(self.http_client.aclose())
        except:
            # Ignore errors during cleanup
            pass


# Singleton instance of the API client
api_client = ApiClient()