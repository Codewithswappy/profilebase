# ProfileBase

![ProfileBase](public/og-image/og-image.png)

**The Structured Skills Profile for Developers.**

ProfileBase is a modern, open-source platform designed to help developers build professional portfolios, showcase their projects, and verify their skills through a data-driven approach.

---

## Features

- **Portfolio Builder:** Create a stunning, responsive portfolio in minutes.
- **Skill Verification:** Link your GitHub to automatically verify and showcase your tech stack.
- **Project Showcase:** detailed project views with rich media support.
- **Resume Generator:** Auto-generate ATS-friendly resumes from your profile data.
- **Analytics:** Track views and engagement on your profile.
- **Custom Domain:** Connect your own domain for a professional touch.

## Tech Stack

Built with a focus on performance, type safety, and modern UX.

| Category      | Technology                                                                                                            |
| :------------ | :-------------------------------------------------------------------------------------------------------------------- |
| **Framework** | ![Next.js](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js&logoColor=white)                 |
| **Styling**   | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) |
| **Database**  | ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)                   |
| **Auth**      | ![NextAuth.js](https://img.shields.io/badge/Auth.js-purple?style=flat-square)                                         |
| **Icons**     | ![Tabler Icons](https://img.shields.io/badge/Tabler_Icons-blue?style=flat-square)                                     |
| **Animation** | ![Motion](https://img.shields.io/badge/Motion-black?style=flat-square&logo=framer&logoColor=white)      |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (or a compatible database provider)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/profilebase.git
    cd profilebase
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file based on `.env.example` and add your database URL and auth secrets.

4.  **Database Setup:**

    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run Development Server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get started.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <img src="https://img.shields.io/badge/Built_with-Love-red?style=flat-square" alt="Built with Love" />
</p>
