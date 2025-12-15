// src/components/admin/AdminPopupManage.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Switch,
  Typography,
  Stack,
} from "@mui/material";
import {
  fetchAdminPopups,
  createPopup,
  updatePopup,
  deletePopup,
} from "../../service/AdminService";
import AdminPopupFormModal from "./AdminPopupFormModal";

export default function AdminPopupManage() {
  const [pageData, setPageData] = useState(null);

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState(null); // null이면 새 작성, 객체면 수정

  const load = async () => {
    try {
      const res = await fetchAdminPopups({ page: 0, size: 20 });
      setPageData(res.data);
    } catch (err) {
      console.error("팝업 목록 로드 실패:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // 🔥 활성 토글 (해당 팝업만 on/off)
  const handleToggleActive = async (popup) => {
    try {
      await updatePopup(popup.id, {
        ...popup,
        active: !popup.active,
      });
      await load();
    } catch (err) {
      console.error("활성 상태 변경 실패:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    try {
      await deletePopup(id);
      await load();
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  // 🔥 새 팝업 작성 버튼 클릭
  const handleOpenCreate = () => {
    setEditingPopup(null);
    setModalOpen(true);
  };

  // 🔥 수정 버튼 클릭
  const handleOpenEdit = (popup) => {
    setEditingPopup(popup);
    setModalOpen(true);
  };

  // 🔥 모달에서 저장 눌렀을 때
  const handleSave = async (formData) => {
    try {
      if (formData.id) {
        // 수정
        await updatePopup(formData.id, formData);
      } else {
        // 새로 생성
        await createPopup(formData);
      }
      setModalOpen(false);
      setEditingPopup(null);
      await load();
    } catch (err) {
      console.error("팝업 저장 실패:", err);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingPopup(null);
  };

  if (!pageData) return <div>Loading...</div>;

  return (
    <Box p={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">팝업 관리</Typography>

        {/* 🔥 새 팝업 작성 버튼 */}
        <Button variant="contained" onClick={handleOpenCreate}>
          팝업 작성
        </Button>
      </Stack>

      <Typography variant="body2" sx={{ mb: 1, color: "gray" }}>
        · 활성 스위치를 켜면, 노출 기간 안에서 메인 접속 시 팝업이 뜹니다.
      </Typography>

      <Table>
        <TableHead sx={{ whiteSpace: "nowrap"  }}>
          <TableRow>
            <TableCell>번호</TableCell>
            <TableCell>제목</TableCell>
            <TableCell>팝업 기간</TableCell>
            <TableCell>활성</TableCell>
            <TableCell align="right">관리</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pageData.content.map((popup) => (
            <TableRow key={popup.id} hover>
              <TableCell>{popup.id}</TableCell>
              <TableCell>{popup.title}</TableCell>
              <TableCell>
                {popup.startAt} ~ {popup.endAt}
              </TableCell>
              <TableCell>
                <Switch
                  checked={popup.active}
                  onChange={() => handleToggleActive(popup)}
                />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleOpenEdit(popup)}
                  >
                    수정
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(popup.id)}
                  >
                    삭제
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 🔥 팝업 작성/수정 모달 */}
      <AdminPopupFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initialData={editingPopup}
      />
    </Box>
  );
}
