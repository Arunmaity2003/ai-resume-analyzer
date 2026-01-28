import { resumes } from "../../constants";
import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar"
import ResumeCard from '../components/ResumeCard';
import { useLocation, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { useEffect } from "react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "ResuNode" },
    { name: "description", content: "smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { isLoading, auth } = usePuterStore()
  const location = useLocation()
  const next = location.search.split('next=')[1]
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth.isAuthenticated) navigate('/auth?next=/')
  }, [auth.isAuthenticated])

  return <main className="bg-url[url('/images/bg-main.svg')] bg-cover">
    <Navbar />
    <section className="main-section justify-center py-16">
      <div className="page-heading">
        <h1>Track Your Applications & Resume Ratings</h1>
        <h2>Review your submission and chech AI-powered feedback.</h2>
      </div>
      {resumes.length > 0 && (
        <div className="resumes-section">
          {resumes.map((resume) => (
            <div key={resume.id}>
              <ResumeCard key={resume.id} resume={resume} />
            </div>
          ))}
        </div>
      )}
    </section>

  </main>
}
