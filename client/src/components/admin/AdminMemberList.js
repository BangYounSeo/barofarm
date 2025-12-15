// src/components/admin/AdminMemberList.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import {
  fetchMembers,
  updateMemberDetail,
} from "../../service/AdminService";
import { fetchMemberSummary  } from "../../service/AdminService";

export default function AdminMemberList() {
  const [summary, setSummary] = useState(null);

  const [members, setMembers] = useState([]);
  const [keyword, setKeyword] = useState("");

  // 페이징
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // 수정 모달 상태
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    userId: "",
    name: "",
    phone: "",
    email: "",
    role: "ROLE_USER",
    status: "ACTIVE", // 🔹 기본값
    password: "",
  });

  // 컴포넌트 안에 추가
  const loadSummary = async () => {
    try {
      const res = await fetchMemberSummary ();
      setSummary(res.data);
    } catch (err) {
      console.error("❌ summary load error", err);
    }
  };

  // 회원 목록 로드
  const load = async (targetPage = page) => {
    try {
      const res = await fetchMembers({ page: targetPage, size, keyword });
      const data = res?.data;
      const content = data?.content ?? data ?? [];

      setMembers(Array.isArray(content) ? content : []);

      if (data && typeof data.totalPages === "number") {
        setTotalPages(data.totalPages);
        setPage(data.number);
      } else {
        setTotalPages(1);
        setPage(0);
      }
    } catch (err) {
      console.error("❌ load error", err);
      setMembers([]);

      if (err.code === "ECONNABORTED") {
        alert("회원 목록 요청이 타임아웃(ECONNABORTED) 되었습니다.");
      } else {
        alert("회원 목록을 불러오지 못했습니다: " + err.message);
      }
    }
  };

  useEffect(() => {
    load(0);
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ROLE_LABEL = {
    ROLE_USER: "일반",
    ROLE_ADMIN: "관리자",
    ROLE_PRODUCER: "셀러", // 셀러 용어 쓸 거면 이렇게
  };

  const STATUS_LABEL = {
    ACTIVE: "활성",
    WITHDRAW: "탈퇴",
    BLOCKED: "정지",
  };

  const handlePageChange = (event, value) => {
    const targetPage = value - 1;
    load(targetPage);
  };

  // 수정 모달 열기
  const handleOpenEdit = (member) => {
    setEditForm({
      userId: member.userId,
      name: member.name ?? "",
      phone: member.phone ?? "",
      email: member.email ?? "",
      role: member.role ?? "ROLE_USER",
      status: member.status || "ACTIVE", // 🔹 현재 status 그대로
      password: "",
    });
    setEditOpen(true);
  };

  const handleCloseEdit = () => setEditOpen(false);

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

const handleSaveEdit = async () => {
  const { userId, name, phone, email, role, status, password } = editForm;

  try {
    await updateMemberDetail(userId, {
      name,
      phone,
      email,
      role,
      status,
      password, // ""인 경우는 백엔드에서 무시하도록 처리
    });

    // ✅ 프론트 목록은 즉시 반영
    setMembers((prev) =>
      prev.map((m) =>
        m.userId === userId
          ? { ...m, name, phone, email, role, status }
          : m
      )
    );

    // ✅ 백엔드 기준 전체/활성 회원수 다시 가져오기
    await loadSummary();

    setEditOpen(false);
  } catch (err) {
    console.error("❌ updateMemberDetail error", err);
    alert("회원 정보 수정에 실패했습니다.");
  }
};

  useEffect(() => {
    fetchMemberSummary ().then((res) => setSummary(res.data));
  }, []);

  if (!summary) return null;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }} >
        사용자 관리 (전체 회원수: {summary.totalMembers} / 활성 회원수: {summary.activeMembers})
      </Typography>

      {/* 검색 */}
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          size="small"
          placeholder="아이디 / 이름 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <IconButton onClick={() => load(0)}>
          <SearchIcon />
        </IconButton>
      </Box>

      {/* 테이블 */}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ whiteSpace: "nowrap"  }}>수정</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap"  }}>아이디</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap"  }}>이름</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap"  }}>전화</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap"  }}>이메일</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap"  }}>권한</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap"  }}>상태</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((m) => {
            const statusValue = m.status || "ACTIVE";
            return (
              <TableRow key={m.userId}>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpenEdit(m)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
                <TableCell>{m.userId}</TableCell>
                <TableCell>{m.name}</TableCell>
                <TableCell>{m.phone}</TableCell>
                <TableCell>{m.email}</TableCell>

                <TableCell>{ROLE_LABEL[m.role] || m.role}</TableCell>

                <TableCell>{STATUS_LABEL[m.status] || m.status}</TableCell>
                

              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* 페이징 */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      {/* 수정 모달 */}
      <Dialog
        open={editOpen}
        onClose={handleCloseEdit}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { height: "75%" } }}
      >
        <DialogTitle>회원 정보 수정</DialogTitle>
        <DialogContent
          dividers
          sx={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="아이디"
              value={editForm.userId}
              size="small"
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="이름"
              value={editForm.name}
              size="small"
              onChange={(e) => handleEditChange("name", e.target.value)}
            />
            <TextField
              label="전화"
              value={editForm.phone}
              size="small"
              onChange={(e) => handleEditChange("phone", e.target.value)}
            />
            <TextField
              label="이메일"
              value={editForm.email}
              size="small"
              onChange={(e) => handleEditChange("email", e.target.value)}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <Select
                size="small"
                value={editForm.role}
                onChange={(e) => handleEditChange("role", e.target.value)}
              >
                <MenuItem value="ROLE_USER">일반회원</MenuItem>
                <MenuItem value="ROLE_PRODUCER">셀러</MenuItem>
                <MenuItem value="ROLE_ADMIN">관리자</MenuItem>
              </Select>

              <Select
                size="small"
                value={editForm.status}
                onChange={(e) =>
                  handleEditChange("status", e.target.value)
                }
              >
                <MenuItem value="ACTIVE">활성</MenuItem>
                <MenuItem value="WITHDRAW">탈퇴</MenuItem>
                <MenuItem value="BLOCKED">정지</MenuItem>
              </Select>
            </Box>

            <TextField
              label="새 비밀번호"
              type="password"
              size="small"
              value={editForm.password}
              onChange={(e) =>
                handleEditChange("password", e.target.value)
              }
              helperText="변경하지 않으려면 비워 두세요."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>취소</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
