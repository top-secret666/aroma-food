# Google Sign-In setup (fix `origin_mismatch`)

Error **400: origin_mismatch** means the page URL is not listed in your OAuth **Web** client.

## 1. Open credentials

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Open OAuth 2.0 Client ID  
   `934997964943-dli89dipdsr9fbgbf6804mdghoc9rd3i`  
   (type must be **Web application**)

## 2. Authorized JavaScript origins

Add **exactly** these (no trailing slash):

```text
http://localhost:3000
https://reactfistapp.vercel.app
https://top-secret666.github.io
```

If you use a preview URL, add it too, for example:

```text
https://reactfistapp-nt5ap1d6c-top-secret666-2624s-projects.vercel.app
```

## 3. Authorized redirect URIs

For Google Identity Services (button on the site) redirects are usually **not** required.  
If the console asks for at least one URI, you can add:

```text
http://localhost:3000
https://reactfistapp.vercel.app
```

## 4. Save and wait

Click **Save**, wait ~1–2 minutes, hard-refresh the site (`Ctrl+Shift+R`).

## 5. Same Client ID everywhere

| Place | Variable |
|-------|----------|
| Local frontend `.env` | `REACT_APP_GOOGLE_CLIENT_ID=934997964943-dli89dipdsr9fbgbf6804mdghoc9rd3i.apps.googleusercontent.com` |
| Local backend (`start-local.ps1`) | `GOOGLE_CLIENT_ID` (same value) |
| Vercel → Project → Settings → Environment Variables | `REACT_APP_GOOGLE_CLIENT_ID` (Production) — then **Redeploy** |

## Check

1. Local: http://localhost:3000/login → Google button  
2. Prod: https://reactfistapp.vercel.app/login → Google button  

If login succeeds but the server returns 401, restart `user-service` with the same `GOOGLE_CLIENT_ID`.
