# Torn Hall of Fame Dashboard

 > Also available on [sixteen05.github.io/torn-faction-hof](https://sixteen05.github.io/torn-faction-hof/)

A professional, crime-themed, and dorky dashboard for Torn game stats. Renders a Hall of Fame for your friends using daily JSON stat dumps from a public GitHub repo.

## Features
- Reads all available daily JSON stat files from a public GitHub repo
- Renders a dashboard with Hall of Fame boards and charts for each metric
- Shows current winners and rankings
- Modular and extensible for new metrics
- Crime, hospital, jail, weapons, and money themed UI

## Sample JSON Payload
```
[
  {
    "date": "2025-05-24",
    "stats": [
      {
        "name": "PlayerOne",
        "crimes": 42,
        "beers": 10,
        "bloodBags": 3,
        "jailTime": 120,
        "moneySmuggled": 50000
      },
      {
        "name": "PlayerTwo",
        "crimes": 55,
        "beers": 5,
        "bloodBags": 1,
        "jailTime": 60,
        "moneySmuggled": 20000
      }
    ]
  },
  {
    "date": "2025-05-23",
    "stats": [
      {
        "name": "PlayerOne",
        "crimes": 40,
        "beers": 8,
        "bloodBags": 2,
        "jailTime": 100,
        "moneySmuggled": 40000
      },
      {
        "name": "PlayerTwo",
        "crimes": 50,
        "beers": 4,
        "bloodBags": 1,
        "jailTime": 50,
        "moneySmuggled": 15000
      }
    ]
  }
]
```

## Getting Started
1. Place your daily JSON stat files in a public GitHub repo.
2. Configure the dashboard to point to your repo.
3. Run `npm run dev` to start the dashboard.

## Theming
- Crime, hospital, jail, weapons, guns, money, trading, and smuggling theme
- Professional, appealing, and dorky look

## Extending
- Add new metrics to the JSON and update the dashboard config/components.
