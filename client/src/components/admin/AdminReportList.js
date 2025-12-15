// src/components/admin/AdminReportList.js
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
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";

import {
  fetchReports,
  updateReportStatus,
  deleteReport,
} from "../../service/AdminService";
import AdminReportDetailModal from "./AdminReportDetailModal";

const STATUS_LABEL = {
  READY: "대기",
  DELETE: "삭제",
  CANCEL: "신고취소",
  BLOCKED: "로그인 제한",
};

export default function AdminReportList() {
  const [reports, setReports] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // 전체

  // 페이징
  const [page, setPage] = useState(0); // 0-based
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // 상세 모달
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const openDetailModal = (report) => {
    setSelectedReport(report);
    setDetailOpen(true);
  };

  const handleSaveDetail = async ({ status, statusReason }) => {
    if (!selectedReport) return;

    try {
      await updateReportStatus(selectedReport.reportId, {
        status,
        statusReason,
      });
      alert("상태가 변경되었습니다.");
      setDetailOpen(false);
      load(page);
    } catch (err) {
      console.error("❌ updateReportStatus error", err);
      alert("상태 변경에 실패했습니다: " + err.message);
    }
  };

  const load = async (targetPage = page) => {
    try {
      const params = {
        page: targetPage,
        size,
        keyword: keyword || undefined,
        status: statusFilter || undefined,
      };

      const res = await fetchReports(params);
      const data = res?.data;
      const content = data?.content ?? data ?? [];

      setReports(Array.isArray(content) ? content : []);

      if (data && typeof data.totalPages === "number") {
        setTotalPages(data.totalPages);
        setPage(data.number);
      } else {
        setTotalPages(1);
        setPage(0);
      }
    } catch (err) {
      console.error("❌ report load error", err);
      setReports([]);
      alert("신고 목록을 불러오지 못했습니다: " + err.message);
    }
  };

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (event, value) => {
    const targetPage = value - 1; // Pagination은 1-based
    load(targetPage);
  };

  const handleSearch = () => {
    // 검색/필터 변경 시 0페이지부터
    load(0);
  };

  const handleDeleteReportClick = async (reportId) => {
    if (
      !window.confirm(
        "이 신고 내역을 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      )
    ) {
      return;
    }

    try {
      await deleteReport(reportId);
      alert("신고 내역이 삭제되었습니다.");
      load(page);
    } catch (err) {
      console.error("❌ deleteReport error", err);
      alert("삭제에 실패했습니다: " + err.message);
    }
  };

  return (
    <Box>
      <AdminReportDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        report={selectedReport}
        onSave={handleSaveDetail}
      />

      <Typography variant="h6" sx={{ mb: 2 }}>
        신고 댓글 관리
      </Typography>

      {/* 검색 / 필터 */}
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          size="small"
          placeholder="유저명 / 신고내용 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <Select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">
            <em>전체 상태</em>
          </MenuItem>
          <MenuItem value="READY">대기</MenuItem>
          <MenuItem value="DELETE">삭제</MenuItem>
          <MenuItem value="CANCEL">신고취소</MenuItem>
          <MenuItem value="BLOCKED">로그인 제한</MenuItem>
        </Select>

        <IconButton onClick={handleSearch}>
          <SearchIcon />
        </IconButton>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ whiteSpace: "nowrap"  }}>수정</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap"  }}>신고번호</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap"  }}>유저명</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap"  }}>날짜</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap"  }}>신고내용</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap"  }}>상태</TableCell>
            <TableCell align="center" sx={{ whiteSpace: "nowrap"  }}>삭제</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reports.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center">
                신고 내역이 없습니다.
              </TableCell>
            </TableRow>
          )}

          {reports.map((r) => (
            <TableRow key={r.reportId}>
              <TableCell>
                <IconButton
                  size="small"
                  onClick={() => openDetailModal(r)}
                  aria-label="수정"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </TableCell>
              <TableCell>{r.reportId}</TableCell>
              <TableCell>{r.userId}</TableCell>
              <TableCell>
                {r.created
                  ? dayjs(r.created).format("YYYY-MM-DD HH:mm")
                  : "-"}
              </TableCell>
              <TableCell>{r.reasonText || r.rawReason}</TableCell>
              <TableCell>{STATUS_LABEL[r.status] || r.status}</TableCell>
              <TableCell align="center">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteReportClick(r.reportId)}
                  aria-label="신고 삭제"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
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
    </Box>
  );
}
