# Better Map (Working Title)

An awesome, modern, and highly interactive mapping tool designed specifically for the HAM radio community.

## The Vision
The goal of **Better Map** is to provide a visually stunning and seamless mapping experience that brings together the disparate pieces of the HAM radio ecosystem. It aims to be the central, beautiful "window" into global radio activity.

While starting with a focus on **casual users**, the platform is engineered for **extreme extensibility**. We are building around a pattern of canonical implementations, allowing the community to easily build integrations for their favorite databases and logging software.

## Technical Stack

To ensure high performance, type safety, and ease of development, the project utilizes the following stack:

*   **Package Manager**: [uv](https://github.com/astral-sh/uv) (for extremely fast Python dependency management)
*   **API Framework**: [FastAPI](https://fastapi.tiangolo.com/) (for building high-performance, type-safe asynchronous APIs)
*   **Frontend UI**: [ReactJS](https://reactjs.org/) with [Vite](https://vitejs.dev/) (for a modern, lightning-fast development experience)
*   **Language**: [TypeScript](https://www.typescriptlang.org/) (to ensure robust, type-safe frontend code)
*   **Deployment**: [Railway](https://railway.app/) (for streamlined, continuous deployment)
This project follows the **Speckit Constitution**, prioritizing:
- **User-Centric UX**
- **Community-Driven Extensibility**
- **Automated Quality Assurance**

## Getting Started

Start the backend from the repository root:

```bash
./scripts/start-backend.sh
```

Start the frontend and Cloudflare tunnel/proxy from the repository root:

```bash
./scripts/start-frontend.sh
```

The frontend script requires `cloudflared`. If `cloudflared` is missing, authentication fails, the tunnel fails to start, or no tunnel URL can be discovered, the script stops the frontend process and prints an actionable error.

## Quality Gates

Backend:

```bash
cd backend
uv run ruff check .
uv run mypy src tests
uv run pytest --cov=src --cov-fail-under=100
```

Frontend:

```bash
cd frontend
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```

Script checks:

```bash
cd backend
uv run pytest ../tests/scripts --cov=../tests/scripts --cov-fail-under=100
```

## Roadmap
- [ ] Core interactive map implementation
- [ ] First canonical integration implementation
- [ ] Community plugin scaffolding tool
- [ ] LLM-based natural language querying
