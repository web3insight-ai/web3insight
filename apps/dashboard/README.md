# Web3Insight

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Web3Insight/Web3Insight)

> A comprehensive metrics platform focused on Web3 ecosystems, communities, repositories, and developers

## Project Overview

While Web3 ecosystems share similarities with traditional open-source communities, standard metric systems often fall short in providing a holistic understanding, trend tracking, and project evaluation specific to Web3 initiatives. Web3Insight aims to bridge this gap by offering tailored analytics and insights for the unique landscape of Web3 projects.

For instance, communities like OpenBuild face challenges in efficiently evaluating active contributors and participants in projects such as their Bootcamp. Manual statistical management is time-consuming, and even with tools like OSS Insight, obtaining detailed performance metrics for individual developers remains difficult. Additionally, there's a lack of standardization in reward distribution within these ecosystems.

## Core Features

1. **Ecosystem Analytics**: Search and analyze active projects and contributors within specific Web3 ecosystems or communities, presenting comprehensive metric data.

2. **Project-Specific Insights**: Enable direct search of metrics data by project name, coupled with AI-powered analysis reports generated using GPT-4.

3. **Developer Profiling**: Search and compile open-source contribution data and on-chain ecosystem participation metrics using GitHub handles or Web3 wallet addresses.

4. **Customized Metric System**: Combine proprietary metric frameworks with a Web3 ecosystem database to offer tailored analysis dimensions for different ecosystems.

5. **Identity Correlation**: Continuously build a reliable database correlating GitHub users, email addresses, and wallet addresses within the Web3 space.

6. **Reward Distribution Platform**: (Currently in development)
   - Direct reward distribution to contributors who are platform users
   - Smart contract-generated Bounties/Grants for non-platform users, allowing them to claim rewards
   - User database matching and email notifications with authentication via GitHub handles

## Technology Stack & Architecture

Web3Insight utilizes Remix.js as its frontend framework, interacting with a custom backend API for data management and user authentication.

1. **Frontend (Remix):** A React-based user interface built with Remix and TypeScript, styled using Tailwind CSS and NextUI components. Handles user interactions, client-side routing, and displays data fetched from the backend API. Remix's server functions primarily handle Server-Side Rendering (SSR) and routing logic.
2. **Backend API & Authentication:** A custom REST API serves as the core backend, providing data operations and handling user authentication (GitHub OAuth).
3. **Database:** PostgreSQL serves as the primary relational database. Redis is used for caching to improve performance.
4. **AI Service:** Leverages OpenAI and Azure OpenAI API providers for generating insights and analysis reports.
5. **External Data Sources:** Fetches data from APIs like OpenDigger, OSS Insight, and RSS3 to gather metrics on repositories, developers, and ecosystems.

**Data Flow:**

User interactions trigger requests within the Remix frontend. Remix handles routing and SSR, making API calls to the custom backend API for data fetching, mutations, and authentication. The backend processes these requests, interacts with the database (PostgreSQL), cache (Redis), AI services, or external APIs as needed, and returns data to the Remix frontend for rendering.

## Roadmap

1. 2024.08 - Project Initiated at ETHShenzhen Hackathon
   1. MVP launch with user system, basic search and analytics features
   2. Integration of AI-powered analysis reports
   3. Use Starknet and OpenBuild as initial test ecosystem/community
2. Q3 2024
   1. Implementation of reward distribution system
   2. Launch of advanced ecosystem-specific metrics and analysis tools
3. Q4 2024
   1. Launch of Web3Insight Reward Distribution System for Starknet and Mantle
4. Q1 2025
   1. Implementation of Web3Insight Ecosystem and Developer Profile Page
   2. Refactor the backend to be more efficient and scalable (completed - migrated from Strapi to custom API)
5. Q2 2025
   1. Get rid of OpenDigger and turn to gharchive and BigQuery for data api
   2. Implementation of Web3Insight Developer Data Platform
   3. Launch of Web3 social data AI agent using RSSHub & n8n

## Project Team

- [pseudoyu](https://github.com/pseudoyu)

## Project Links

| Item           | Link                                         |
| -------------- | -------------------------------------------- |
| Online Service | [web3insight.ai](https://web3insight.ai) |

## Contact Information

- Email: [pseudoyu@connect.hku.hk](mailto:pseudoyu@connect.hku.hk)
