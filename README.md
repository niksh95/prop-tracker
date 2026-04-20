# Prop Firm Payment & Payout Tracker

A modern, clean Next.js app to track prop firm payments and payouts, manage funds, and prepare for Indian advance tax calculations. Features USD-INR conversion with banking costs and prop firm-wise P/L analysis.

## Features

- **Dashboard**: Overview of balance, payouts, payments, and quarterly tax estimate with recent transactions.
- **Transaction Management**: Add and view detailed transaction history with USD-INR conversion and banking costs.
- **Prop Firm P/L Analysis**: Performance breakdown for each trading firm with net profit calculations.
- **Reports & Analytics**: Monthly summaries, detailed tax information, and annual profit/loss reports.
- **Indian Tax Calculation**: Automatic quarterly advance tax estimates based on income tax slabs with 4% cess.
- **Currency Conversion**: Live USD-INR rates (via exchangerate-api.com), auto-conversion with configurable banking costs.
- **Settings**: Customize banking cost percentage and review tax calculation details.
- **Modern UI**: Clean, responsive design with Tailwind CSS, professional dashboard, and intuitive navigation.

## Routes & Pages

- `/` - **Dashboard**: Main overview and recent transactions
- `/add` - **Add Transaction**: Form to record payments/payouts with live INR preview
- `/transactions` - **All Transactions**: Filterable table with search and detailed history
- `/prop-firm-pl` - **Prop Firm P/L**: Firm-wise performance and profitability analysis
- `/reports` - **Reports**: Monthly breakdown, tax estimates, and annual summaries
- `/settings` - **Settings**: Configure banking costs and view tax information

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Currency API**: exchangerate-api.com (free tier: 1500 requests/month)
- **Deployment**: Vercel (recommended)

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up database**:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Visit [http://localhost:3000](http://localhost:3000)

## Usage

1. **Add Transaction**: Click "+ Add" in navbar → enter USD amount, prop firm, and date → app fetches rate and calculates INR.
2. **View Dashboard**: See balance, tax estimates, and recent activity at a glance.
3. **Analyze by Firm**: Go to "Prop Firm P/L" to see which firms are most profitable.
4. **Tax Prep**: Check "Reports" for quarterly tax estimates and annual summaries.
5. **Settings**: Adjust banking cost percentage (default 1.5%) for accurate conversions.

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com) → "New Project" → select your repo.
3. Vercel auto-detects Next.js; click "Deploy".
4. (Optional) For production: set up Vercel Postgres instead of SQLite.

```bash
# Or deploy via CLI:
npm install -g vercel
vercel
```

## Database (Production)

For production, migrate from SQLite to **Vercel Postgres**:

1. Create a Vercel Postgres database.
2. Update `prisma.config.ts` and `.env`:
   ```
   DATABASE_URL="postgresql://user:password@host/dbname"
   ```
3. Run:
   ```bash
   npx prisma migrate deploy
   ```

## Notes

- **Tax Disclaimer**: Calculations are estimates based on standard Indian tax slabs. **Consult a Chartered Accountant** for accurate tax filing.
- **Currency**: Assumes USD payments/payouts; rates update daily via free API.
- **Privacy**: All data stored locally; no cloud sync or backups.
- **Auth**: Personal use; no authentication (add if needed).

## Development Notes

- Uses SQLite for easy local development.
- Auto-generates Prisma client on build.
- Tailwind CSS for responsive, modern UI.
- No external chart libraries (kept minimal for now; can add Recharts later).

## Future Enhancements

- PDF report export
- Advanced charting (Recharts)
- Multi-user support with auth
- Cloud data sync
- Email notifications for quarterly tax deadlines
- Mobile app (React Native)

## License

Personal use. Feel free to modify for your needs.
