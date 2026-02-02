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

//         // if (!imageFile) return setStatusText("Error: Failed to convert pdf too image !!!")
//         // setStatusText("uploading the image ...")
//         if (!imageFile.file) {
//             setStatusText(imageFile.error ?? "PDF to image failed");
//             return;
//         }

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

//         data.feedback = JSON.parse(feedbackText)

//         // fallback protection
//         if (feedback.overallScore === 0) {
//             feedback.overallScore =
//                 Math.round(
//                     (
//                         feedback.ATS.score +
//                         feedback.toneAndStyle.score +
//                         feedback.content.score +
//                         feedback.structure.score
//                     ) / 4
//                 );
//         }

//         setStatusText("Analysis complete, redirecting ... ")
//         console.log(data)
//         navigate(`/resume/${uuid}`,)
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



import React, { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { convertPdfToImage } from "~/lib/Pdf2image";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "constants/index";

const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    try {
      setIsProcessing(true);
      setStatusText("Uploading resume...");

      /* 1️⃣ Upload PDF */
      const uploadedPdf = await fs.upload([file]);
      if (!uploadedPdf) throw new Error("PDF upload failed");

      /* 2️⃣ Convert PDF → Image */
      setStatusText("Converting resume to image...");
      const imageResult = await convertPdfToImage(file);

      if (!imageResult.file) {
        throw new Error(imageResult.error || "PDF to image failed");
      }

      /* 3️⃣ Upload Image */
      setStatusText("Uploading image...");
      const uploadedImage = await fs.upload([imageResult.file]);
      if (!uploadedImage) throw new Error("Image upload failed");

      /* 4️⃣ AI Analysis */
      setStatusText("Analyzing resume...");
      const aiResult = await ai.feedback(
        uploadedPdf.path,
        prepareInstructions({ jobTitle, jobDescription })
      );

      if (!aiResult) throw new Error("AI feedback failed");

      const feedbackText =
        typeof aiResult.message.content === "string"
          ? aiResult.message.content
          : aiResult.message.content[0].text;

      const parsedFeedback = JSON.parse(feedbackText);

      /* 5️⃣ Fallback overall score */
      if (!parsedFeedback.overallScore || parsedFeedback.overallScore === 0) {
        parsedFeedback.overallScore = Math.round(
          (parsedFeedback.ATS.score +
            parsedFeedback.toneAndStyle.score +
            parsedFeedback.content.score +
            parsedFeedback.structure.score) / 4
        );
      }

      /* 6️⃣ SAVE ONLY ONCE (IMPORTANT FIX) */
      const uuid = generateUUID();

      const finalData = {
        id: uuid,
        resumePath: uploadedPdf.path,
        imagePath: uploadedImage.path,
        companyName,
        jobTitle,
        jobDescription,
        feedback: parsedFeedback,
      };

      await kv.set(`resume:${uuid}`, JSON.stringify(finalData));

      setStatusText("Analysis complete! Redirecting...");
      navigate(`/resume/${uuid}`);
    } catch (err: any) {
      console.error(err);
      setStatusText(err.message || "Something went wrong");
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) return;

    const formData = new FormData(e.currentTarget);
    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section justify-center py-16">
        <h1 className="page-heading py-16">
          Smart feedback for your dream job
        </h1>

        {isProcessing ? (
          <>
            <h2>{statusText}</h2>
            <img
              src="/images/resume-scan.gif"
              alt="processing"
              className="w-full"
            />
          </>
        ) : (
          <h2>Drop your resume for ATS score & improvement tips</h2>
        )}

        {!isProcessing && (
          <form
            id="upload-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 mt-8"
          >
            <div className="form-div">
              <label htmlFor="company-name">Company Name</label>
              <input
                type="text"
                name="company-name"
                placeholder="Company name"
                required
              />
            </div>

            <div className="form-div">
              <label htmlFor="job-title">Job Title</label>
              <input
                type="text"
                name="job-title"
                placeholder="Job Title"
                required
              />
            </div>

            <div className="form-div">
              <label htmlFor="job-description">Job Description</label>
              <textarea
                name="job-description"
                rows={5}
                placeholder="Job Description"
                required
              />
            </div>

            <div className="form-div">
              <label>Upload Resume</label>
              <FileUploader onFileSelect={handleFileSelect} />
            </div>

            <button className="primary-button" type="submit">
              Analyze Resume
            </button>
          </form>
        )}
      </section>
    </main>
  );
};

export default Upload;

