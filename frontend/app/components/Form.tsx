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

  const [duplicateProjectsA, setDuplicateProjectsA] = useState<
    DuplicateProject[]
  >([]);
  const [matchedTeachersA, setMatchedTeachersA] = useState<MatchedTeacher[]>(
    []
  );

  const [duplicateProjectsB, setDuplicateProjectsB] = useState<
    DuplicateProject[]
  >([]);
  const [matchedTeachersB, setMatchedTeachersB] = useState<MatchedTeacher[]>(
    []
  );

  const [timeA, setTimeA] = useState<number | null>(null);
  const [timeB, setTimeB] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);

  const processApiResult = (
    apiResponse: FullApiResponse
  ): { projects: DuplicateProject[]; teachers: MatchedTeacher[] } => {
    const projects: DuplicateProject[] = [];
    const teachers: MatchedTeacher[] = [];

    if (apiResponse.data && apiResponse.data.length > 0) {
      apiResponse.data.forEach((item) => {
        if ("match_teacher" in item) {
          // เพิ่ม tid เข้าไปด้วยถ้ามี
          teachers.push(...item.match_teacher);
        } else {
          projects.push({ topic: item.topic, reason: item.reason });
        }
      });
    }
    return { projects, teachers };
  };

  const fetchSuggestions = async () => {
    if (projectTitle.length > 3 || projectDescription.length > 10) {
      setIsLoading(true);
      setShowSuccessMessage(false);

      // 🛑 รีเซ็ตเวลาเริ่มต้น 🛑
      setTimeA(null);
      setTimeB(null);

      // 1. กำหนดการเรียก API ตัวที่ 1 (check-first-ai) พร้อมจับเวลา
      const callA = async () => {
        const startTime = performance.now(); // ⏰ เริ่มจับเวลา
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/topics/check-first-ai`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                topic: projectTitle,
                description: projectDescription,
              }),
            }
          );
          const data: FullApiResponse = await response.json();
          const endTime = performance.now(); // ⏰ หยุดจับเวลา

          const result = processApiResult(data);
          setDuplicateProjectsA(result.projects);
          setMatchedTeachersA(result.teachers);
          setTimeA(parseFloat((endTime - startTime).toFixed(2))); // 💾 บันทึกเวลา
          return {
            projects: result.projects.length,
            teachers: result.teachers.length,
          };
        } catch (error) {
          console.error("AI 1 Failed:", error);
          setDuplicateProjectsA([]); // เคลียร์เฉพาะ state ของตัวเอง
          setMatchedTeachersA([]);
          setTimeA(0); // ตั้งเวลาเป็น 0 หรือ Error
          return { projects: 0, teachers: 0 };
        }
      };

      // 2. กำหนดการเรียก API ตัวที่ 2 (check-secound-ai) พร้อมจับเวลา
      const callB = async () => {
        const startTime = performance.now(); // ⏰ เริ่มจับเวลา
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/topics/check-secound-ai`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                topic: projectTitle,
                description: projectDescription,
              }),
            }
          );
          const data: FullApiResponse = await response.json();
          const endTime = performance.now(); // ⏰ หยุดจับเวลา

          const result = processApiResult(data);
          setDuplicateProjectsB(result.projects);
          setMatchedTeachersB(result.teachers);
          setTimeB(parseFloat((endTime - startTime).toFixed(2))); // 💾 บันทึกเวลา
          return {
            projects: result.projects.length,
            teachers: result.teachers.length,
          };
        } catch (error) {
          console.error("AI 2 Failed:", error);
          setDuplicateProjectsB([]);
          setMatchedTeachersB([]);
          setTimeB(0); // อาจจะตั้งเป็น 0 หรือ -1 เพื่อระบุว่าเกิด Error
          return { projects: 0, teachers: 0 };
        }
      };

      try {
        // 3. เรียกทั้งสองฟังก์ชันแบบขนานและรอผลลัพธ์
        const [resultA_Count, resultB_Count] = await Promise.all([
          callA(),
          callB(),
        ]);

        // การแสดง Success Message จะต้องขึ้นอยู่กับผลลัพธ์รวม
        const totalProjects = resultA_Count.projects + resultB_Count.projects;
        const totalTeachers = resultA_Count.teachers + resultB_Count.teachers;

        if (totalProjects === 0 && totalTeachers === 0) {
          setShowSuccessMessage(true);
        } else {
          setShowSuccessMessage(false);
        }
      } catch (error) {
        // Promise.all จะ catch error ถ้ามี promise ตัวใดตัวหนึ่ง throw error
        console.error(
          "An unexpected error occurred during parallel API calls:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      // เคลียร์ State ทั้งหมดเมื่อเงื่อนไขความยาวไม่ผ่าน
      setDuplicateProjectsA([]);
      setMatchedTeachersA([]);
      setTimeA(null);
      setDuplicateProjectsB([]);
      setMatchedTeachersB([]);
      setTimeB(null);
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/permission/get-student-team/${userID}`
      );
      console.log(userResponse.data);
      const teamID = userResponse.data.teamid;
      console.log(teamID);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/topics/projects/submit`,
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

        setDuplicateProjectsA([]);
        setMatchedTeachersA([]);
        setDuplicateProjectsB([]);
        setMatchedTeachersB([]);
        setTimeA(null); // เคลียร์ Time state ด้วย
        setTimeB(null); // เคลียร์ Time state ด้วย
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
          <p className="text-[#111418] tracking-light text-[30px] font-bold leading-tight min-w-72">
            ส่งข้อเสนอโครงงานใหม่
          </p>
        </div>

        {/* Input Field สำหรับ Project Title */}
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-[#111418] text-base font-medium leading-normal pb-2">
              หัวข้อโครงงานที่จะเสนอ
            </p>
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
            <p className="text-[#111418] text-base font-medium leading-normal pb-2">
              คำอธิบาย
            </p>
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
            <p className="text-[#111418] text-base font-medium leading-normal pb-2">
              อาจารย์ที่ปรึกษา
            </p>
            <select
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-14 bg-[image:--select-button-svg] placeholder:text-[#60758a] p-4 text-base font-normal leading-normal text-[#111418]`}
              value={advisorId}
              onChange={(e) => setAdvisorId(e.target.value)}
              required
            >
              <option value="" className="text-gray-400">
                เลือกอาจารย์
              </option>
              <option value="2">ผศ.ดวิษ แสนโภชน์</option>
              <option value="3">อ.เชาวน์ ปอแก้ว</option>
              <option value="1">ดร.ณัฐพล หาญสมุทร</option>
              <option value="7">ดร.สุจิตตรา สาระคนธ์</option>
              <option value="4">ดร.อภิวัฒน์ บุตรวงค์</option>
              <option value="5">อ.ชลติพันธ์  เปล่งวิทยา</option>
              <option value="6">อ.เมธยา ราชคมน์</option>
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
        <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          โครงงานที่อาจเกิดความซ้ำคล้าย
        </h3>
        <p className="text-[#60758a] text-base font-normal leading-normal pb-8 pt-1 px-4 border-b border-gray-200 last:border-b-0 ">
          ระบบของเราพบโครงการที่มีชื่อหรือคำอธิบายคล้ายกัน
          โปรดตรวจสอบเพื่อให้แน่ใจว่าโครงการของคุณมีความโดดเด่น
        </p>
        {/* Conditional Rendering based on state */}
        {isLoading ? (
          <div className="p-4 text-gray-500">กำลังค้นหาข้อมูล...</div>
        ) : showSuccessMessage ? (
          <div className="p-4 text-green-600">
            🎉 ยอดเยี่ยม! ไม่พบหัวข้อโครงการที่ซ้ำซ้อนจากระบบ AI ทั้งหมด
            ยินดีด้วยครับ!{" "}
          </div>
        ) : (
          <>
            {/* 🛑 FIX 1: ตรวจสอบสถานะเริ่มต้น (Initial State) 🛑 */}
            {timeA === null && timeB === null ? (
              <div className="p-4 text-gray-500 text-center text-base">
                กรุณากรอกข้อมูลหัวข้อโครงการและกดปุ่ม{" "}
                <span className="font-bold text-[#111418]">
                  "ตรวจสอบหัวข้อ"
                </span>{" "}
                เพื่อเริ่มการวิเคราะห์ผลลัพธ์จากระบบ AI
              </div>
            ) : (
              // 2. แสดงผลลัพธ์แบบแบ่งครึ่งต่อเมื่อมีการค้นหาแล้ว (timeA หรือ timeB ไม่ใช่ null)
              <div className="flex flex-col md:flex-row md:space-x-4">
                {/* ส่วนแสดงผลลัพธ์จาก AI ตัวที่ 1 */}
                <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-gray-200">
                  {/* ส่วนหัว (รวมเวลา) - โค้ดเดิม */}
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] pb-2">
                      ผลการตรวจสอบจาก AI ระบบที่ 1
                    </h3>
                    {timeA !== null && (
                      <p
                        className={`text-sm font-semibold ${
                          timeA > 0 ? "text-blue-600" : "text-red-600"
                        }`}
                      >
                        {timeA > 0 ? `🚀 ${timeA} ms` : "❌ Failed"}
                      </p>
                    )}
                  </div>

                  <p className="text-[#60758a] text-sm font-normal leading-normal pb-4">
                    ระบบที่ 1 (GPT-OSS-120B: เน้นความแม่นยำสูง
                    ในการวิเคราะห์เชิงความหมายและให้ผลลัพธ์ละเอียดรอบด้าน) :
                  </p>

                  {/* Display Duplicate Projects A */}
                  {duplicateProjectsA.length > 0 ? (
                    <>
                      <h4 className="font-bold text-gray-700 mt-2">
                        รายการโครงการที่ซ้ำซ้อน: ({duplicateProjectsA.length}{" "}
                        รายการ)
                      </h4>
                      {duplicateProjectsA.slice(0, 3).map((project, index) => (
                        <div
                          key={`A-proj-${index}`}
                          className="p-4 border-b border-gray-100 last:border-b-0"
                        >
                          <p className="text-[#111418] text-base font-bold leading-tight">
                            {project.topic}
                          </p>
                          <p className="text-[#60758a] text-sm font-normal leading-normal">
                            {project.reason}
                          </p>
                        </div>
                      ))}
                    </>
                  ) : (
                    // 🛑 FIX 2: แสดงข้อความ "ไม่พบ" ก็ต่อเมื่อการค้นหาสำเร็จ (timeA > 0) เท่านั้น 🛑
                    timeA !== null &&
                    timeA > 0 && (
                      <>
                        <h4 className="font-bold text-gray-700 mt-2">
                          รายการโครงการที่ซ้ำซ้อน: ({duplicateProjectsA.length}{" "}
                          รายการ)
                        </h4>
                        <div className="text-sm text-green-500 mt-2">
                          ✅ ไม่พบโครงการซ้ำคล้ายจากระบบที่ 1
                        </div>
                      </>
                    )
                  )}

                  {/* Display Matched Teachers A - โค้ดเดิม */}
                  {matchedTeachersA.length > 0 && (
                    <>
                      <h4 className="font-bold text-gray-700 mt-4">
                        อาจารย์ที่แนะนำ: ({matchedTeachersA.length} ท่าน)
                      </h4>
                      {matchedTeachersA.slice(0, 3).map((teacher, index) => (
                        <div
                          key={`A-teacher-${index}`}
                          className="p-4 border-b border-gray-100 last:border-b-0"
                        >
                          <p className="text-[#111418] text-base font-bold leading-tight">
                            {teacher.name}
                          </p>
                          <p className="text-[#60758a] text-sm font-normal leading-normal">
                            เหตุผล: {teacher.reason}
                          </p>
                        </div>
                      ))}
                    </>
                  )}

                  {/* 🛑 FIX 3: แสดง Error หาก timeA เป็น 0 🛑 */}
                  {timeA === 0 && (
                    <div className="text-sm text-red-500 mt-2">
                      ❌ การตรวจสอบจากระบบที่ 1 ล้มเหลวเนื่องจากข้อผิดพลาด
                    </div>
                  )}
                </div>

                {/* ส่วนแสดงผลลัพธ์จาก AI ตัวที่ 2 - ปรับปรุงเงื่อนไขเช่นเดียวกัน */}
                <div className="flex-1 p-4">
                  {/* ส่วนหัว (รวมเวลา) - โค้ดเดิม */}
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] pb-2 mt-4 md:mt-0">
                      ผลการตรวจสอบจาก AI ระบบที่ 2
                    </h3>
                    {timeB !== null && (
                      <p
                        className={`text-sm font-semibold ${
                          timeB > 0 ? "text-blue-600" : "text-red-600"
                        }`}
                      >
                        {timeB > 0 ? `🚀 ${timeB} ms` : "❌ Failed"}
                      </p>
                    )}
                  </div>

                  <p className="text-[#60758a] text-sm font-normal leading-normal pb-4">
                    ระบบที่ 2 (Grok-4-Fast: เน้นความเร็วในการประมวลผล
                    และมีความสามารถในการจับคู่คำหลักที่รวดเร็ว) :
                  </p>

                  {/* Display Duplicate Projects B */}
                  {duplicateProjectsB.length > 0 ? (
                    <>
                      <h4 className="font-bold text-gray-700 mt-2">
                        รายการโครงการที่ซ้ำซ้อน: ({duplicateProjectsB.length}{" "}
                        รายการ)
                      </h4>
                      {duplicateProjectsB.slice(0, 3).map((project, index) => (
                        <div
                          key={`B-proj-${index}`}
                          className="p-4 border-b border-gray-100 last:border-b-0"
                        >
                          <p className="text-[#111418] text-base font-bold leading-tight">
                            {project.topic}
                          </p>
                          <p className="text-[#60758a] text-sm font-normal leading-normal">
                            {project.reason}
                          </p>
                        </div>
                      ))}
                    </>
                  ) : (
                    // 🛑 FIX 2: แสดงข้อความ "ไม่พบ" ก็ต่อเมื่อการค้นหาสำเร็จ (timeB > 0) เท่านั้น 🛑
                    timeB !== null &&
                    timeB > 0 && (
                      <>
                        <h4 className="font-bold text-gray-700 mt-2">
                          รายการโครงการที่ซ้ำซ้อน: ({duplicateProjectsB.length}{" "}
                          รายการ)
                        </h4>
                        <div className="text-sm text-green-500 mt-2">
                          ✅ ไม่พบโครงการซ้ำคล้ายจากระบบที่ 2
                        </div>
                      </>
                    )
                  )}

                  {/* Display Matched Teachers B - โค้ดเดิม */}
                  {matchedTeachersB.length > 0 && (
                    <>
                      <h4 className="font-bold text-gray-700 mt-4">
                        อาจารย์ที่แนะนำ: ({matchedTeachersB.length} ท่าน)
                      </h4>
                      {matchedTeachersB.slice(0, 3).map((teacher, index) => (
                        <div
                          key={`B-teacher-${index}`}
                          className="p-4 border-b border-gray-100 last:border-b-0"
                        >
                          <p className="text-[#111418] text-base font-bold leading-tight">
                            {teacher.name}
                          </p>
                          <p className="text-[#60758a] text-sm font-normal leading-normal">
                            เหตุผล: {teacher.reason}
                          </p>
                        </div>
                      ))}
                    </>
                  )}

                  {/* 🛑 FIX 3: แสดง Error หาก timeB เป็น 0 🛑 */}
                  {timeB === 0 && (
                    <div className="text-sm text-red-500 mt-2">
                      ❌ การตรวจสอบจากระบบที่ 2 ล้มเหลวเนื่องจากข้อผิดพลาด
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        {submissionSuccess && (
          <div className="p-4 text-green-600">
            ✅ ส่งหัวข้อโครงงานเรียบร้อยแล้ว!
          </div>
        )}
        {submissionError && (
          <div className="p-4 text-red-600">
            ⚠️ เกิดข้อผิดพลาด: {submissionError}
          </div>
        )}
        {/* Submit Button */}
        <div className="flex justify-stretch">
          <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-end">
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#0c7ff2] text-white text-sm font-bold leading-normal tracking-[0.015em]"
            >
              <span className="truncate">
                {isSubmitting ? "กำลังส่ง..." : "ส่งหัวข้อโครงงาน"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Form;
