// src/components/admin/AdminNoticeList.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
  Stack,
  Pagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function AdminNoticeList() {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const navigate = useNavigate();

  const loadList = async () => {
    try {
      const res = await fetch("/api/notice");

      if (!res.ok) {
        const text = await res.text();
        console.error("공지사항 목록 API 오류:", res.status, text);
        return;
      }

      const data = await res.json();
      setList(data);
    } catch (err) {
      console.error("공지사항 목록 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  const deleteNotice = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/notice/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const msg = await res.text();
        console.error("삭제 실패:", res.status, msg);
        alert("삭제 실패\n" + msg);
        return;
      }

      alert("삭제 완료");
      loadList();
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(list.length / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const currentPageList = list.slice(startIndex, startIndex + rowsPerPage);

  const handleChangePage = (_event, value) => {
    setPage(value);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            공지사항 관리
          </Typography>

          <Button
            variant="contained"
            size="small"
            onClick={() => navigate("/admin/notice/write")}
          >
            공지 등록
          </Button>
        </Box>

        <Box
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "grey.200",
          }}
        >
          <Table size="small">
            <TableHead sx={{ bgcolor: "grey.100" }}>
              <TableRow>
                <TableCell sx={{ width: 70, whiteSpace: "nowrap"  }}>번호</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap"  }}>제목</TableCell>
                <TableCell sx={{ width: 140, whiteSpace: "nowrap"  }}>작성자</TableCell>
                <TableCell sx={{ width: 130, whiteSpace: "nowrap"  }}>작성일</TableCell>
                <TableCell sx={{ width: 90, whiteSpace: "nowrap"  }}>상단고정</TableCell>
                <TableCell sx={{ width: 80, whiteSpace: "nowrap"  }}>강조</TableCell>
                <TableCell sx={{ width: 150, whiteSpace: "nowrap"  }}>관리</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {currentPageList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      등록된 공지사항이 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                currentPageList.map((n) => (
                  <TableRow key={n.numNotice} hover>
                    <TableCell>{n.numNotice}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {n.pin && (
                          <Chip
                            label="공지"
                            size="small"
                            color="warning"
                            sx={{ fontSize: 11, height: 22 }}
                          />
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: n.strong ? 700 : 400,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: 300,
                          }}
                        >
                          {n.subject}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{n.userId}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {n.createdAt?.slice(0, 10)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {n.pin ? (
                        <Chip label="고정" size="small" color="primary" />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {n.strong ? (
                        <Chip label="강조" size="small" color="secondary" />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            navigate(`/admin/notice/edit/${n.numNotice}`)
                          }
                        >
                          수정
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => deleteNotice(n.numNotice)}
                        >
                          삭제
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>

        {list.length > 0 && (
          <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handleChangePage}
              shape="rounded"
              color="primary"
              siblingCount={1}
              boundaryCount={1}
            />
          </Stack>
        )}
      </Paper>
    </Container>
  );
}
