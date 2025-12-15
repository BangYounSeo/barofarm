// src/components/admin/AdminQnaManage.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Chip,
} from "@mui/material";
import { fetchQnaList, answerQna } from "../../service/AdminService";

export default function AdminQnaManage() {
  const [qnaList, setQnaList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answer, setAnswer] = useState("");

  const load = async () => {
    const res = await fetchQnaList({ page: 0, size: 50, status: "ready" });
    setQnaList(res.data.content);
  };

  useEffect(() => {
    load();
  }, []);

  const openDialog = (qna) => {
    setSelected(qna);
    setAnswer(qna.answerContent || "");
  };

  const handleSave = async () => {
    await answerQna(selected.numQna, {
      answerContent: answer,
      answerBy: "admin", // 실제로는 로그인한 관리자 아이디 쓰면 됨
    });
    setSelected(null);
    setAnswer("");
    load();
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Q&A 관리
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>번호</TableCell>
            <TableCell>제목</TableCell>
            <TableCell>작성자</TableCell>
            <TableCell>상태</TableCell>
            <TableCell>작성일</TableCell>
            <TableCell>답변</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {qnaList.map((q) => (
            <TableRow key={q.numQna}>
              <TableCell>{q.numQna}</TableCell>
              <TableCell>{q.subject}</TableCell>
              <TableCell>{q.member?.userId}</TableCell>
              <TableCell>
                {q.status === "ready" ? (
                  <Chip label="미답변" color="warning" size="small" />
                ) : (
                  <Chip label="답변완료" color="success" size="small" />
                )}
              </TableCell>
              <TableCell>{q.created?.substring(0, 10)}</TableCell>
              <TableCell>
                <Button size="small" onClick={() => openDialog(q)}>
                  {q.answerContent ? "수정" : "답변하기"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth>
        <DialogTitle>Q&A 답변</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            Q: {selected?.content}
          </Typography>
          <TextField
            multiline
            minRows={4}
            fullWidth
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>취소</Button>
          <Button variant="contained" onClick={handleSave}>
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
