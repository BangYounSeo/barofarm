// com.barofarm.barofarm.controller.admin.AdminQnaController
package com.barofarm.barofarm.controller.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;

import com.barofarm.barofarm.entity.QnaBoard;
import com.barofarm.barofarm.repository.QnaBoardRepository;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/qna")
public class AdminQnaController {

    private final QnaBoardRepository qnaBoardRepository;

    @GetMapping
    public Page<QnaBoard> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status // ready / answered 등
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "created"));

        if (status == null || status.isEmpty()) {
            return qnaBoardRepository.findAll(pageable);
        }
        return qnaBoardRepository.findByStatus(status, pageable);
    }

    @PatchMapping("/{numQna}/answer")
    public QnaBoard answer(
            @PathVariable int numQna,
            @RequestBody AnswerRequest dto
    ) {
        QnaBoard qna = qnaBoardRepository.findById(numQna)
                .orElseThrow(() -> new IllegalArgumentException("no qna"));

        qna.setAnswerContent(dto.getAnswerContent());
        qna.setAnswerBy(dto.getAnswerBy());
        qna.setAnswerAt(java.time.LocalDateTime.now());
        qna.setStatus("answered");

        return qnaBoardRepository.save(qna);
    }

    @lombok.Data
    public static class AnswerRequest {
        private String answerContent;
        private String answerBy;
    }
}
