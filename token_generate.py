from google.oauth2 import service_account
from google.auth.transport.requests import Request

# Path to the service account JSON key file
SERVICE_ACCOUNT_FILE = r'c:\Users\91817\Desktop\Home\04 Pager.ai\00 Credentials\pagerai-493ec0427564.json'

# The scope you want to use for accessing the Google Sheets API
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

# Create credentials using the service account file and the specified scopes
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES)

# Generate an access token
credentials.refresh(Request())
access_token = credentials.token

print(f'Access Token: {access_token}')
