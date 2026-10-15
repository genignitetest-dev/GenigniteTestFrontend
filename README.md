# GenigniteTestFrontend

React + Vite frontend for GenZ Hackers Night.

## Backend connection

The frontend sends registration requests to:

`https://genignitetestbackend.onrender.com/api/registrations/order`

The API base URL is read from `VITE_API_URL`. If that variable is not set to an absolute HTTP(S) URL, the frontend defaults to the deployed Render backend.

For Vercel, you can set this environment variable under **Project → Settings → Environment Variables**:

- Name: `VITE_API_URL`
- Value: `https://genignitetestbackend.onrender.com/api`

Redeploy after changing environment variables.

## Run locally

1. Install Node.js (LTS).
2. Run `npm install`.
3. Copy `.env.example` to `.env` if you want to set the API URL explicitly.
4. Run `npm run dev`.

## Registration status

Online Razorpay checkout has been removed because the current backend saves registrations as `PENDING` and does not process payments. The frontend confirms submission, displays the registration ID and pending status, and tells participants that no online payment has been charged. Do not treat this as a paid/confirmed registration until the organisers enable a payment flow or provide instructions.
