"use client";

import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

// Interfaces for Type-checking data
interface MatchedTeacher {
  name: string;
  tid: number;
  reason: string;
}

interface DecodedToken {
  sub: string;
  role: "student" | "teacher";
  exp: number;
}

interface DuplicateProject {
  topic: string;
  reason: string;
  uuid?: string; // Optional since not all items might have it
  tid?: number | null;
}

interface ApiResponseData {
  topic: string;
  reason: string;
  uuid: string;
  tid: number;
}

interface FullApiResponse {
  status: string;
  data: (ApiResponseData | { match_teacher: MatchedTeacher[] })[];
}


const Form = () => {
  // State for form fields
  const [projectTitle, setProjectTitle] = useState<string>("");
  const [projectDescription, setProjectDescription] = useState<string>("");
  const [academicYear, setAcademicYear] = useState<string>("");
  const [advisorId, setAdvisorId] = useState<string>(""); // เปลี่ยนชื่อ State จาก advisorName เป็น advisorId เพื่อให้สอดคล้องกับค่าที่เก็บ // State for data from the API

  const [duplicateProjects, setDuplicateProjects] = useState<
    DuplicateProject[]
  >([]);
  const [matchedTeachers, setMatchedTeachers] = useState<MatchedTeacher[]>([]); // New state for teachers
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);

  const fetchSuggestions = async () => {
    if (projectTitle.length > 3 || projectDescription.length > 10) {
      setIsLoading(true);
      setShowSuccessMessage(false); // Reset success message on new fetch

      try {
        const response = await fetch("http://127.0.0.1:8000/api/topics/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: projectTitle,
            description: projectDescription,
          }),
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const apiResponse: FullApiResponse = await response.json(); // --- Correctly parse the API response data ---
        const projects: DuplicateProject[] = [];
        const teachers: MatchedTeacher[] = [];

        if (apiResponse.data && apiResponse.data.length > 0) {
          apiResponse.data.forEach((item) => {
            // Check if the item has the 'match_teacher' property
            if ("match_teacher" in item) {
              teachers.push(...item.match_teacher);
            } else {
              // Otherwise, it's a duplicate project
              projects.push({ topic: item.topic, reason: item.reason });
            }
          });
        } // Update states
        setDuplicateProjects(projects);
        setMatchedTeachers(teachers);

        if (projects.length === 0 && teachers.length === 0) {
          setShowSuccessMessage(true);
        } else {
          setShowSuccessMessage(false);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setDuplicateProjects([]);
        setMatchedTeachers([]);
        setShowSuccessMessage(false);
      } finally {
        setIsLoading(false);
      }
    } else {
      setDuplicateProjects([]);
      setMatchedTeachers([]);
      setShowSuccessMessage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError(null);
    setSubmissionSuccess(false);

    const token = localStorage.getItem("access_token");
    if (!token) {
      setSubmissionError("Please log in to submit a project.");
      setIsSubmitting(false);
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const userID = decoded.sub;

      const userResponse = await axios.get<{ teamid: string }>(
        `http://127.0.0.1:8000/permission/get-student-team/${userID}`
      );
      console.log(userResponse.data)
      const teamID = userResponse.data.teamid;
      console.log(teamID)
      const response = await axios.post(
        "http://127.0.0.1:8000/api/topics/projects/submit",
        {
            teamid: teamID, // ✅ แก้ไขแล้ว
            name: projectTitle, // ✅ แก้ไขแล้ว
            tid: parseInt(advisorId), // ✅ แก้ไขแล้ว
            academic_year: parseInt(academicYear), // ✅ ถูก
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setSubmissionSuccess(true); // Clear form fields after successful submission
        setProjectTitle("");
        setProjectDescription("");
        setAcademicYear("");
        setAdvisorId("");
        setDuplicateProjects([]);
        setMatchedTeachers([]);
        setShowSuccessMessage(false);
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status === 409
      ) {
        setSubmissionError(error.response.data.detail);
      } else {
        setSubmissionError("An error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckTopic = () => {
    fetchSuggestions();
  };

  return (
    <div className="layout-content-container flex flex-col w-[512px] py-5 max-w-[960px] flex-1">
      {/* ... (Your form elements are unchanged) ... */}
      <form onSubmit={handleSubmit}>
        <div className="py-4">
          <p className="text-[#111418] tracking-light text-[30px] font-bold leading-tight min-w-72">ส่งข้อเสนอโครงงานใหม่</p>
        </div>

        {/* Input Field สำหรับ Project Title */}
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-[#111418] text-base font-medium leading-normal pb-2">หัวข้อโครงงานที่จะเสนอ</p>
            <input
              placeholder="กรอกหัวข้อโครงงานของคุณ"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-14 placeholder:text-[#60758a] p-4 text-base font-normal leading-normal"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-[#111418] text-base font-medium leading-normal pb-2">คำอธิบาย</p>
            <textarea
              placeholder="อธิบายรายละเอียดเกี่ยวกับโครงงานพอสังเขป"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none min-h-36 placeholder:text-[#60758a] p-4 text-base font-normal leading-normal"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            ></textarea>
          </label>
        </div>
         {/* Select Field สำหรับ อาจารย์ที่ปรึกษา */}
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-[#111418] text-base font-medium leading-normal pb-2">อาจารย์ที่ปรึกษา</p>
            <select
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-14 bg-[image:--select-button-svg] placeholder:text-[#60758a] p-4 text-base font-normal leading-normal text-[#111418]`}
              value={advisorId}
              onChange={(e) => setAdvisorId(e.target.value)}
              required
            >
              <option value="" className="text-gray-400">เลือกอาจารย์</option>
              <option value="2">ผศ.ดวิษ แสนโภชน์</option>  
              <option value="3">อ.เชาวน์ ปอแก้ว</option>  
              <option value="1">ดร.ณัฐพล หาญสมุทร</option>  
              <option value="7">ดร.สุจิตตรา สาระคนธ์</option>
            </select>
          </label>
        </div>
        {/* Input Field สำหรับ Academic Year */}
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-[#111418] text-base font-medium leading-normal pb-2">
              ปีการศึกษา
            </p>
            <input
              placeholder="ปีที่เริ่มทำโครงงาน (พ.ศ.)"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-14 placeholder:text-[#60758a] p-4 text-base font-normal leading-normal"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              required
            />
          </label>
        </div>
         {/* Check Topic Button */}
        <div className="flex justify-stretch">
          <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-start">
            <button
              onClick={handleCheckTopic}
              type="button"
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#7D91A6] text-white text-sm font-bold leading-normal tracking-[0.015em]"
              disabled={isLoading || isSubmitting}
            >
              <span className="truncate">
                {isLoading ? "กำลังตรวจสอบ..." : "ตรวจสอบหัวข้อ"}
              </span>
            </button>
          </div>
        </div>
         {/* Section for Potential Duplicates and Teachers */}
        <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">โครงงานที่อาจเกิดความซ้ำคล้าย</h3>
        <p className="text-[#60758a] text-base font-normal leading-normal pb-8 pt-1 px-4 border-b border-gray-200 last:border-b-0 ">ระบบของเราพบโครงการที่มีชื่อหรือคำอธิบายคล้ายกัน โปรดตรวจสอบเพื่อให้แน่ใจว่าโครงการของคุณมีความโดดเด่น 
        </p>
         {/* Conditional Rendering based on state */}
        {isLoading ? (
          <div className="p-4 text-gray-500">กำลังค้นหาข้อมูล...</div>
        ) : showSuccessMessage ? (
          <div className="p-4 text-green-600">🎉 ยอดเยี่ยม! ไม่พบหัวข้อโครงการที่ซ้ำซ้อนในระบบ ยินดีด้วยครับ!  </div>
        ) : (
          <>
             {/* Display Duplicate Projects */}
            {duplicateProjects.length > 0 && (
              <div className="p-4">   
                <h4 className="font-bold text-gray-700">รายการโครงการที่ซ้ำซ้อน:</h4>
                {duplicateProjects.slice(0, 3).map((project, index) => (
                  <div
                    key={index}
                    className="p-4 border-b border-gray-200 last:border-b-0 pb-14"
                  >
                    <div className="flex flex-col gap-1 rounded-lg">  
                      <p className="text-[#111418] text-base font-bold leading-tight">{project.topic}</p>
                      <p className="text-[#60758a] text-sm font-normal leading-normal">{project.reason} </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Display Matched Teachers */}
            {matchedTeachers.length > 0 && (
              <div className="p-4">
                <h4 className="font-bold text-gray-700">อาจารย์ที่แนะนำ:</h4>
                {matchedTeachers.slice(0, 3).map((teacher, index) => (
                  <div
                    key={index}
                    className="p-4 border-b border-gray-200 last:border-b-0 pb-14"
                  >
                    <div className="flex flex-col gap-1 rounded-lg">
                      <p className="text-[#111418] text-base font-bold leading-tight">
                        {teacher.name}
                      </p>
                      <p className="text-[#60758a] text-sm font-normal leading-normal">{teacher.reason} </p> 
                    </div>
                  </div>
                ))}
              </div>
            )}
               {/* Initial state or no results message */} 
            {duplicateProjects.length === 0 && matchedTeachers.length === 0 && (
              <div className="p-4 text-gray-500">กรุณาพิมพ์หัวข้อและคำอธิบายเพื่อตรวจสอบความซ้ำซ้อน</div>
            )}
          </>
        )}
        {submissionSuccess && (
          <div className="p-4 text-green-600">✅ ส่งหัวข้อโครงงานเรียบร้อยแล้ว!</div>
        )}
        {submissionError && (
          <div className="p-4 text-red-600">⚠️ เกิดข้อผิดพลาด: {submissionError}</div>
        )}
         {/* Submit Button */}
        <div className="flex justify-stretch">
          <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-end">
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#0c7ff2] text-white text-sm font-bold leading-normal tracking-[0.015em]"
            >
              <span className="truncate">{isSubmitting ? "กำลังส่ง..." : "ส่งหัวข้อโครงงาน"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Form;
