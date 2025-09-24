"use client";

import ConfirmModal from "./ConfirmModal";
import RemarkModal from "./RemarkModal";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

// Interfaces (เหมือนเดิม)
interface DecodedToken {
  sub: string;
  role: "student" | "teacher";
  exp: number;
}

interface UserData {
  tid: string;
  name: string;
}

interface Topic {
  tpid: string;
  name: string;
  status: string;
  teamid: string;
  tid: string;
  academic_year: string;
  remark?: string;
}

export default function Topics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topicToProcess, setTopicToProcess] = useState<Topic | null>(null);
  const [actionType, setActionType] = useState<"accept" | "reject" | null>(
    null
  );
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    "pending" | "pass" | "not-pass" | "all"
  >("pending");

  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [remarkToShow, setRemarkToShow] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchUserData() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/");
        return;
      }

      try {
        const decoded: DecodedToken = jwtDecode(token);
        const userID = decoded.sub;

        const response = await axios.get<UserData>(
          `http://127.0.0.1:8000/permission/get-teacher-profile/${userID}`
        );

        setUserData(response.data); // <--- ตั้งค่า UserData ที่นี่
      } catch (error) {
        console.error("Error fetching user data or decoding token:", error);
        router.push("/");
      }
    }

    fetchUserData();
  }, [router]);

  useEffect(() => {
    // ฟังก์ชันนี้จะทำงานก็ต่อเมื่อ userData ไม่ใช่ null
    if (userData) {
      const loadTopicData = async () => {
        try {
          // ใช้ userData.tid ที่มั่นใจว่ามีค่าแล้ว
          const response = await axios.get<Topic[]>(
            `http://127.0.0.1:8000/api/scrum/topic/${userData.tid}`,
            {
              headers: {
                "Cache-Control": "no-cache",
              },
            }
          );

          setTopics(response.data); // ตั้งค่า topics state
          console.log("Fetched topics:", response.data);
        } catch (error) {
          console.error("Failed to load topic data:", error);
        } finally {
          setLoading(false);
        }
      };

      loadTopicData();
    }
  }, [userData, router]);

  const handleOpenModal = (topic: Topic, action: "accept" | "reject") => {
    setTopicToProcess(topic); // เปลี่ยนจาก topic: string เป็น topic: Topic
    setActionType(action);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTopicToProcess(null);
    setActionType(null);
  };

  const handleOpenRemarkModal = (remark: string) => {
    setRemarkToShow(remark);
    setIsRemarkModalOpen(true);
  };

  const handleCloseRemarkModal = () => {
    setIsRemarkModalOpen(false);
    setRemarkToShow("");
  };

  const handleConfirmAction = async (remark: string) => {
    // เช็คว่ามี topicToProcess และ actionType อยู่หรือไม่
    if (!actionType || !topicToProcess) return;

    setIsLoading(true);

    console.log(topicToProcess);

    const requestBody = {
      action: actionType,
      remark: remark,
      tid: topicToProcess.tid,
      teamid: topicToProcess.teamid,
      topicName: topicToProcess.name,
      year: topicToProcess.academic_year.toString(),
    };

    try {
      // ใช้ tpid จาก topicToProcess
      const response = await axios.put(
        `http://127.0.0.1:8000/api/topics/action/${topicToProcess.tpid}`,
        requestBody
      );

      console.log("API Response:", response.data.message);

      // อัปเดต state ของ topics ให้ถูกต้อง
      setTopics((prevTopics) =>
        prevTopics.map((t) =>
          t.tpid === topicToProcess.tpid
            ? { ...t, status: response.data.new_status, remark: remark }
            : t
        )
      );
    } catch (error) {
      console.error("Failed to process topic action:", error);
    } finally {
      setIsLoading(false);
      handleCloseModal();
    }
  };

  const confirmButtonClass =
    actionType === "accept"
      ? "bg-blue-600 hover:bg-blue-700"
      : "bg-red-600 hover:bg-red-700";
  const messageColorClass =
    actionType === "accept" ? "text-blue-600" : "text-red-600";

  const filteredTopics = topics.filter((topic) => {
    // ถ้า filterStatus เป็น 'all' ให้แสดงทุกรายการ
    if (filterStatus === "all") {
      return true;
    }
    // มิเช่นนั้น ให้แสดงเฉพาะรายการที่ status ตรงกัน
    return topic.status === filterStatus;
  });
  if (loading) {
    return (
      <>
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <h1 className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">
            อนุมัติหัวข้อ
          </h1>
        </div>
        <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          หัวข้อที่เสนอมา
        </h2>{" "}
        <div className="px-4 pb-4 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">สถานะ:</span>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-3 py-1 text-sm rounded-full ${
              filterStatus === "pending"
                ? "bg-yellow-500 text-white"
                : "bg-gray-200 text-gray-700 cursor-pointer"
            }`}
          >
            รออนุมัติ
          </button>
          <button
            onClick={() => setFilterStatus("pass")}
            className={`px-3 py-1 text-sm rounded-full ${
              filterStatus === "pass"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700 cursor-pointer"
            }`}
          >
            อนุมัติแล้ว
          </button>
          <button
            onClick={() => setFilterStatus("not-pass")}
            className={`px-3 py-1 text-sm rounded-full ${
              filterStatus === "not-pass"
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-700 cursor-pointer"
            }`}
          >
            ถูกปฏิเสธ
          </button>
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1 text-sm rounded-full ${
              filterStatus === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 cursor-pointer"
            }`}
          >
            ทั้งหมด
          </button>
        </div>
        <div className="px-4 py-3 @container">
          <div className="flex overflow-hidden rounded-lg border border-[#dbe0e6] bg-white">
            <table className="flex-1">
              <thead>
                <tr className="bg-white">
                  <th className="px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                    ชื่อเรื่อง
                  </th>
                  <th className="px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                    กลุ่มที่
                  </th>
                  <th className="px-4 py-3 text-left text-[#111418] w-40 text-sm font-medium leading-normal">
                    สถานะ
                  </th>
                  <th className="px-4 py-3 text-left text-[#111418] w-60 text-[#60758a] text-sm font-medium leading-normal">
                    การตอบรับ
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-t-[#dbe0e6]">
                  <td className="h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                    Loading...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <h1 className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">
          อนุมัติหัวข้อ
        </h1>
      </div>
      <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        หัวข้อที่เสนอมา
      </h2>

      {/* 3. UI สำหรับเลือก Filter */}
      <div className="px-4 pb-4 flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">สถานะ:</span>
        <button
          onClick={() => setFilterStatus("pending")}
          className={`px-3 py-1 text-sm rounded-full ${
            filterStatus === "pending"
              ? "bg-yellow-500 text-white"
              : "bg-gray-200 text-gray-700 cursor-pointer"
          }`}
        >
          รออนุมัติ
        </button>
        <button
          onClick={() => setFilterStatus("pass")}
          className={`px-3 py-1 text-sm rounded-full ${
            filterStatus === "pass"
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-700 cursor-pointer"
          }`}
        >
          อนุมัติแล้ว
        </button>
        <button
          onClick={() => setFilterStatus("not-pass")}
          className={`px-3 py-1 text-sm rounded-full ${
            filterStatus === "not-pass"
              ? "bg-red-500 text-white"
              : "bg-gray-200 text-gray-700 cursor-pointer"
          }`}
        >
          ถูกปฏิเสธ
        </button>
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-3 py-1 text-sm rounded-full ${
            filterStatus === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 cursor-pointer"
          }`}
        >
          ทั้งหมด
        </button>
      </div>

      <div className="px-4 py-3 @container">
        <div className="flex overflow-hidden rounded-lg border border-[#dbe0e6] bg-white">
          <table className="flex-1">
            <thead>
              <tr className="bg-white">
                <th className="px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                  ชื่อเรื่อง
                </th>
                <th className="px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                  กลุ่มที่
                </th>
                <th className="px-4 py-3 text-left text-[#111418] w-40 text-sm font-medium leading-normal">
                  สถานะ
                </th>
                <th className="px-4 py-3 text-left text-[#111418] w-60 text-[#60758a] text-sm font-medium leading-normal">
                  การตอบรับ
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTopics.map((topic, index) => (
                <tr key={index} className="border-t border-t-[#dbe0e6]">
                  <td className="h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal">
                    {topic.name}
                  </td>
                  <td className="h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                    {topic.teamid}
                  </td>
                  <td className="h-[72px] px-4 py-2 w-40">
                    {/* ใช้ Conditional Class เพื่อกำหนดสีตามสถานะ */}
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium 
                        ${
                          topic.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : ""
                        }
                        ${
                          topic.status === "pass"
                            ? "bg-green-100 text-green-800"
                            : ""
                        }
                        ${
                          topic.status === "not-pass"
                            ? "bg-red-100 text-red-800"
                            : ""
                        }
                      `}
                    >
                      {/* ใช้ Conditional Text เพื่อแสดงข้อความที่เหมาะสม */}
                      {topic.status === "pending" && "รออนุมัติ"}
                      {topic.status === "pass" && "อนุมัติแล้ว"}
                      {topic.status === "not-pass" && "ถูกปฏิเสธ"}
                    </span>
                  </td>
                  <td className="h-[72px] px-4 py-2 w-60">
                    {/* --- 4. Conditional Rendering ใน Cell นี้ --- */}
                    {topic.status === "pending" ? (
                      // ถ้าสถานะเป็น 'pending', แสดงปุ่ม ตกลง/ปฏิเสธ
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(topic, "accept")} // ส่ง topic object
                          className="flex-1 rounded-md bg-blue-500 px-3 py-2 text-white shadow-sm cursor-pointer hover:bg-blue-600"
                        >
                          ตกลง
                        </button>
                        <button
                          onClick={() => handleOpenModal(topic, "reject")} // ส่ง topic object
                          className="flex-1 rounded-md bg-gray-300 px-3 py-2 text-gray-800 shadow-sm cursor-pointer hover:bg-gray-400"
                        >
                          ปฏิเสธ
                        </button>
                      </div>
                    ) : (
                      // ถ้าสถานะอื่น, แสดงปุ่ม 'ดูเหตุผล'
                      <button
                        onClick={() =>
                          handleOpenRemarkModal(
                            topic.remark || "ไม่มีเหตุผลประกอบ"
                          )
                        }
                        disabled={!topic.remark} // ปิดการใช้งานปุ่มถ้าไม่มี remark
                        className="w-full rounded-md border-[1px] border-gray-400 px-3 py-2 text-black shadow-sm cursor-pointer hover:bg-gray-200 disabled:bg-gray-200 disabled:cursor-not-allowed"
                      >
                        {!topic.remark ? "ไม่มี" : "ดูเหตุผล"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <RemarkModal
          isOpen={isRemarkModalOpen}
          onClose={handleCloseRemarkModal}
          remark={remarkToShow}
        />
        <ConfirmModal
          isOpen={isModalOpen}
          onConfirm={handleConfirmAction}
          onCancel={handleCloseModal}
          title={`ยืนยันการ${
            actionType === "accept" ? "ตกลง" : "ปฏิเสธ"
          }หัวข้อโครงงาน`}
          message={`คุณต้องการ${
            actionType === "accept" ? "ตกลง" : "ปฏิเสธ"
          }หัวข้อ "${topicToProcess?.name}" ใช่หรือไม่?`}
          confirmButtonColor={confirmButtonClass}
          messageColor={messageColorClass}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}
