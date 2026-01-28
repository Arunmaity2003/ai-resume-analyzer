// import { prepareInstructions } from 'constants/index'
// import React, { useState, type FormEvent } from 'react'
// import { useNavigate } from 'react-router'
// import FileUploader from '~/components/FileUploader'
// import Navbar from '~/components/Navbar'
// import { convertPdfToImage } from '~/lib/Pdf2image'
// import { usePuterStore } from '~/lib/puter'
// import { generateUUID } from '~/lib/utils'

// const Upload = () => {
//     const { auth, isLoading, fs, ai, kv } = usePuterStore()
//     const navigate = useNavigate()
//     const [isProcessing, setIsProcessing] = useState(false)
//     const [statusText, setStatusText] = useState("")
//     const [file, setFile] = useState<File | null>(null)

//     const handleFileSelect = (file: File | null) => {
//         setFile(file)
//     }

//     const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File }) => {
//         setIsProcessing(true)
//         setStatusText("Uploading your file ...")

//         const uploadedfile = await fs.upload([file])
//         if (!uploadedfile) return setStatusText("Error: failed to upload file")
//         setStatusText("Converting to image ...")

//         const imageFile = await convertPdfToImage(file)

//         if (!imageFile) return setStatusText("Error: Failed to convert pdf too image !!!")
//         setStatusText("uploading the image ...")

//         const uploadedImage = await fs.upload([imageFile.file]);
//         if (!uploadedImage) return setStatusText("Error: Failed to upload image !!!")

//         setStatusText("Preparing data ...")

//         const uuid = generateUUID()

//         const data = {
//             id: uuid,
//             resumePath: uploadedfile.path,
//             imagePath: uploadedImage.path,
//             companyName, jobTitle, jobDescription,
//             feedback: ''
//         }

//         await kv.set(`resume:${uuid}`, JSON.stringify(data))

//         setStatusText("Analyze ...")

//         const feedback = await ai.feedback(
//             uploadedfile.path,
//             prepareInstructions({ jobTitle, jobDescription })
//         )

//         if (!feedback) return setStatusText('Error: Failed to analyze resume');

//         const feedbackText = typeof feedback.message.content === 'string'
//             ? feedback.message.content
//             : feedback.message.content[0].text;

//             data.feedback = JSON.parse(feedbackText)

//         setStatusText("Analysis complete, redirecting ... ")
//         console.log(data)
//     }

//     const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         const form = e.currentTarget.closest('form')
//         if (!form) return
//         const formData = new FormData(form)

//         const companyName = formData.get('company-name') as string
//         const jobTitle = formData.get('job-title') as string
//         const jobDescription = formData.get('job-description') as string

//         if (!file) return

//         handleAnalyze({ companyName, jobTitle, jobDescription, file })
//     }
//     return (
//         <main className="bg-url[url('/images/bg-main.svg')] bg-cover">
//             <Navbar />
//             <section className="main-section justify-center py-16">
//                 <h1 className='page-heading py-16'>Smart feedback for your dream job</h1>
//                 {isProcessing ? (
//                     <>
//                         <h2>{statusText}</h2>
//                         <img src="/images/resume-scan.gif" alt="search" className='w-full' />
//                     </>
//                 ) : (
//                     <h2>Drop your resume for an ATS score and improve tips</h2>
//                 )}

//                 {!isProcessing && (
//                     <form id='upload-form' onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8'>
//                         <div className="form-div">
//                             <label htmlFor="company-name">Company Name</label>
//                             <input type="text" placeholder='Company name' name="company-name" id='company-name' />
//                         </div>
//                         <div className="form-div">
//                             <label htmlFor="job-title">Job Title</label>
//                             <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
//                         </div>
//                         <div className="form-div">
//                             <label htmlFor="job-description">Job Description</label>
//                             <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
//                         </div>

//                         <div className="form-div">
//                             <label htmlFor="uploader">Upload Resume</label>
//                             <FileUploader onFileSelect={handleFileSelect} />
//                         </div>

//                         <button className="primary-button" type="submit">
//                             Analyze Resume
//                         </button>
//                     </form>
//                 )}
//             </section>
//         </main>
//     )
// }

// export default Upload


//----------------------------------------------------------------------------------------------

import { type FormEvent, useState } from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";
import { convertPdfToImage } from '~/lib/Pdf2image';

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleAnalyze = async () => {
        if (!file) {
            alert("Please upload a PDF resume.");
            return;
        }

        if (!jobTitle || !jobDescription) {
            alert("Please enter job title and description.");
            return;
        }

        setIsProcessing(true);
        setStatusText("Uploading resume...");

        const uuid = uuidv4();

        try {
            /* ---------------- FILE UPLOAD ---------------- */
            const uploadedFile = await (window as any).puter.fs.upload(file, {
                path: `/resumes/${uuid}.pdf`,
            });

            const data: ResumeData = {
                id: uuid,
                jobTitle,
                jobDescription,
                filePath: uploadedFile.path,
            };

            setStatusText("Analyzing resume with AI...");

            /* ---------------- AI ANALYSIS ---------------- */
            let feedback;

            try {
                feedback = await (window as any).puter.ai.chat({
                    model: "usage-limited",
                    messages: [
                        {
                            role: "system",
                            content:
                                "You are an ATS resume analyzer. Return ONLY valid JSON.",
                        },
                        {
                            role: "user",
                            content: prepareInstructions({
                                jobTitle,
                                jobDescription,
                            }),
                        },
                    ],
                    files: [uploadedFile.path],
                });
            } catch (err) {
                console.error("AI error:", err);
                setStatusText("AI analysis failed.");
                setIsProcessing(false);
                return;
            }

            if (!feedback?.choices?.[0]?.message?.content) {
                setStatusText("No response from AI.");
                setIsProcessing(false);
                return;
            }

            const feedbackText = feedback.choices[0].message.content;

            let parsedFeedback;
            try {
                parsedFeedback = JSON.parse(feedbackText);
            } catch (err) {
                console.error("Invalid JSON from AI:", feedbackText);
                setStatusText("AI returned invalid data.");
                setIsProcessing(false);
                return;
            }

            data.feedback = parsedFeedback;

            /* ---------------- SAVE RESULT ---------------- */
            await (window as any).puter.kv.set(
                `resume:${uuid}`,
                JSON.stringify(data)
            );

            setStatusText("Analysis complete. Redirecting...");
            navigate(`/resume/${uuid}`);
        } catch (err) {
            console.error("Upload failed:", err);
            setStatusText("Something went wrong.");
            setIsProcessing(false);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if (!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" />
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="primary-button" type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}
export default Upload

