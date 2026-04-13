# EdgeBoard

Sports betting dashboard - compare lines across sportsbooks, track promotions, and monitor deposits.

## Features

- **Line Comparison** - See odds from FanDuel, DraftKings, BetMGM, Caesars side-by-side with best line highlighted
- **Promotions Tracker** - Filter active promos by sport and sportsbook
- **Account Management** - Track deposits, withdrawals, and bonuses per sportsbook
- **CSV Import** - Upload transaction history from any sportsbook
- **Dashboard** - Total deposits, active accounts, best lines, and deposit chart

## Project Structure

```
edgeboard/
  frontend/       # Static HTML/CSS/JS dashboard
    index.html    # Main dashboard with 5 tabs
    styles.css    # Dark theme styling
    app.js        # Tab nav, rendering, CSV parser, state management
  backend/        # FastAPI Python API
    main.py       # API endpoints for accounts, transactions, odds, promos
    requirements.txt
```

## Quick Start

### Frontend Only (no backend needed)
```bash
cd frontend
python -m http.server 8080
# Open http://localhost:8080
```

### Backend API
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# API docs at http://localhost:8000/docs
```

### Live Odds (optional)
Get a free API key from https://the-odds-api.com and set it:
```bash
export ODDS_API_KEY=your_key_here
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard | Summary stats |
| GET | /api/accounts | List accounts with deposit totals |
| POST | /api/accounts | Add sportsbook account |
| GET | /api/transactions | List all transactions |
| POST | /api/transactions | Add single transaction |
| POST | /api/transactions/import-csv | Upload CSV file |
| GET | /api/promotions | List promos (filter by sport/book) |
| POST | /api/promotions | Add promotion |
| GET | /api/odds/{sport} | Live odds from The Odds API |

## CSV Format

```csv
date,sportsbook,type,amount
2026-01-15,fanduel,deposit,500.00
2026-01-20,draftkings,deposit,250.00
2026-02-01,fanduel,withdrawal,200.00
2026-02-10,betmgm,bonus,50.00
```

## Roadmap

- [ ] PostgreSQL database
- [ ] User authentication
- [ ] Real-time odds refresh
- [ ] Bet tracking and P/L
- [ ] Mobile responsive improvements
- [ ] Email alerts for line movement
