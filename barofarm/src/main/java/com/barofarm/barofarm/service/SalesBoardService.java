package com.barofarm.barofarm.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.barofarm.barofarm.dto.SalesBoardCreateDTO;
import com.barofarm.barofarm.dto.SalesBoardDTO;
import com.barofarm.barofarm.dto.member.ProducerDTO;
import com.barofarm.barofarm.dto.salesBoard.BoardImageDTO;
import com.barofarm.barofarm.dto.salesBoard.OptionDetailDTO;
import com.barofarm.barofarm.dto.salesBoard.OptionGroupDTO;
import com.barofarm.barofarm.dto.salesBoard.ProductDetailResponse;
import com.barofarm.barofarm.dto.salesBoard.QnaDTO;
import com.barofarm.barofarm.dto.salesBoard.ReviewDTO;
import com.barofarm.barofarm.dto.salesBoard.SalesBoardDetailResponse;
import com.barofarm.barofarm.entity.BoardImage;
import com.barofarm.barofarm.entity.Member;
import com.barofarm.barofarm.entity.Producer;
import com.barofarm.barofarm.entity.SalesBoard;

import com.barofarm.barofarm.entity.SalesOptionGroup;
import com.barofarm.barofarm.entity.SalesOptionDetail;

import com.barofarm.barofarm.repository.BoardImageRepository;
import com.barofarm.barofarm.repository.CartRepository;
import com.barofarm.barofarm.repository.MemberRepository;
import com.barofarm.barofarm.repository.ProducerRepository;
import com.barofarm.barofarm.repository.QnaBoardRepository;
import com.barofarm.barofarm.repository.ReviewRepository;
import com.barofarm.barofarm.repository.SalesBoardRepository;
import com.barofarm.barofarm.repository.SalesOptionDetailRepository;
import com.barofarm.barofarm.repository.SalesOptionGroupRepository;

import lombok.RequiredArgsConstructor;

import java.util.Base64;
//⭐ 추가된 부분
import com.barofarm.barofarm.service.S3Service;

//아래 작성된 데이터를 모두 취합하여 dto로 묶어 반환함
@Service
@RequiredArgsConstructor
public class SalesBoardService {

    // 각종 Repository 의존성 주입
    private final SalesBoardRepository salesBoardRepository;
    private final BoardImageRepository boardImageRepository;
    private final SalesOptionGroupRepository salesOptionGroupRepository;
    private final SalesOptionDetailRepository salesOptionDetailRepository;
    private final ProducerRepository producerRepository;
    private final ReviewRepository reviewRepository;
    private final QnaBoardRepository qnaBoardRepository;
    private final CartRepository cartRepository; 

    // ⭐ 추가된 부분 : AWS S3 업로드 서비스 사용
    private final S3Service s3Service;

    // 멤버불러옴
    private final MemberRepository memberRepository;

    // 상품 상세페이지 데이터를 조회하여 DTO로 묶어서 반환하는 메서드
    // numBrd로 SalesBoard를 찾고 있으면 board에 넣고 없으면 RuntimeException 발생시켜라
    public ProductDetailResponse getDetail(int numBrd) {

        // 상품 기본 정보 조회
        SalesBoard sb = salesBoardRepository.findById(numBrd)
                .orElseThrow(() -> new RuntimeException("상품이 존재하지 않습니다"));

        SalesBoardDetailResponse boardDto = SalesBoardDetailResponse.from(sb);

        // 2) 이미지 조회
        List<BoardImageDTO> imageDtos = boardImageRepository.findBySalesBoardNumBrdOrderBySortOrderDesc(numBrd)
                .stream().map(BoardImageDTO::from).collect(Collectors.toList());

        // 3) 옵션 그룹 조회
        List<OptionGroupDTO> optionGroupDtos = salesOptionGroupRepository.findBySalesBoardNumBrd(numBrd)
                .stream().map(OptionGroupDTO::from).collect(Collectors.toList());

        // 4) 옵션 상세 조회
        List<OptionDetailDTO> optionDetailDtos = salesOptionDetailRepository
                .findBySalesOptionGroup_SalesBoard_NumBrd(numBrd)
                .stream()
                .map(OptionDetailDTO::from)
                .collect(Collectors.toList());

        // 5) 생산자 정보
        Producer producer = null;

        if (sb.getMember() != null && sb.getMember().getUserId() != null) {
            producer = producerRepository.findByMemberUserId(sb.getMember().getUserId());
        }

        ProducerDTO producerDto = producer != null ? ProducerDTO.from(producer) : null;

        // 6) 리뷰
        List<ReviewDTO> reviewDtos = reviewRepository.findBySalesBoard_NumBrdOrderByCreatedDesc(numBrd) // ✅ 단순 메소드 사용
                .stream()
                .map(ReviewDTO::from)
                .collect(Collectors.toList());

        // 7) QNA → 아직 없으면 빈 리스트
        List<QnaDTO> qnaDtos = qnaBoardRepository.findBySalesBoard_NumBrdOrderByCreatedDesc(numBrd)
                .stream()
                .map(QnaDTO::from)
                .collect(Collectors.toList());

        // 8) 🔥 통합 DTO 생성
        ProductDetailResponse response = new ProductDetailResponse();
        response.setBoard(boardDto);
        response.setImages(imageDtos);
        response.setOptionGroups(optionGroupDtos);
        response.setOptionDetails(optionDetailDtos);
        response.setProducer(producerDto);
        response.setReviews(reviewDtos);
        response.setQnas(qnaDtos);

        // 9) Producer 상세 정보 세팅
        if (producer != null) {
            response.setFarmName(producer.getFarmName());
            response.setAddr1(producer.getAddr1());
            response.setPhone(producer.getCallCenter());

            response.setStartCall(producer.getStartCall());
            response.setEndCall(producer.getEndCall());
        }
        
        // ⭐ HIT_COUNT 증가
        sb.setHitCount(sb.getHitCount() + 1);
        salesBoardRepository.save(sb);
        
     // ⭐ 사업자 등록 정보 추가
        if (producer != null && producer.getBusinessRegistration() != null) {
            response.setBizNo(producer.getBusinessRegistration().getBizNo());
            response.setCeoName(producer.getBusinessRegistration().getCeoName());
        }

        return response;
    }

 // ===========================
    // 🔥 상품 목록 조회 (품절 상품 맨 뒤로!)
    // ===========================
    public Page<SalesBoardDTO> getList(String productType, Integer productItem, String keyword, int page, int size) {

        List<String> statusList = Arrays.asList("common", "stop");
        Pageable pageable = PageRequest.of(page - 1, size);

        Page<SalesBoard> result;

        // 1) 대분류 + 소분류 모두
        if (productType != null && productItem != null) {
            result = salesBoardRepository.findByProductTypeAndProductItemSorted(
                    productType, productItem, statusList, pageable);
        }
        // 2) 소분류만
        else if (productItem != null) {
            result = salesBoardRepository.findByProductItemSorted(
                    productItem, statusList, pageable);
        }
        // 3) 대분류 + 검색어
        else if (productType != null && keyword != null) {
            result = salesBoardRepository.findByProductTypeAndKeywordSorted(
                    productType, keyword, statusList, pageable);
        }
        // 4) 대분류만
        else if (productType != null) {
            result = salesBoardRepository.findByProductTypeSorted(
                    productType, statusList, pageable);
        }
        // 5) 검색어만
        else if (keyword != null) {
            result = salesBoardRepository.findByKeywordSorted(
                    keyword, statusList, pageable);
        }
        // 6) 전체 보기
        else {
            result = salesBoardRepository.findAllSorted(statusList, pageable);
        }

        return result.map(SalesBoardDTO::toDTO);
    }
    
    // 판매글 저장
    public int createProduct(SalesBoardCreateDTO dto) {

        // Member 조회 (userId 받아서 Member 객체 찾기)
        Member member = memberRepository.findByUserId(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("회원 정보가 존재하지 않습니다."));

    	 Producer producer = producerRepository.findByMemberUserId(dto.getUserId());// @formatter:off 
		// @formatter:on

        // 1. 판매글 저장
        SalesBoard entity = new SalesBoard();
        entity.setSubject(dto.getProductName());
        entity.setContent(dto.getDescription());
        entity.setProductType(dto.getProductType());
        entity.setProductItem(dto.getProductItem());
        entity.setOrigin(dto.getOrigin());
        entity.setPrice(dto.getPrice());
        entity.setStatus(dto.getStatus());
        entity.setHitCount(0);
        entity.setStock(0);

        entity.setMember(member);
        entity.setProducer(producer);

        SalesBoard saved = salesBoardRepository.save(entity);

        // 2. 대표 이미지 저장
        if (dto.getMainImage() != null && !dto.getMainImage().isEmpty()) {
            saveBoardImage(saved, dto.getMainImage(), true, 0);
        }

        // 3. 추가 이미지 저장
        if (dto.getExtraImages() != null) {
            for (int i = 0; i < dto.getExtraImages().size(); i++) {
                saveBoardImage(saved, dto.getExtraImages().get(i), false, i + 1);
            }
        }

        // 4. 옵션 그룹 및 상세 저장
        if (dto.getOptionGroups() != null) {
            dto.getOptionGroups().forEach(groupDto -> {

                // 옵션 그룹 저장
                SalesOptionGroup group = new SalesOptionGroup();
                group.setName(
                        (groupDto.getGroupName() != null && !groupDto.getGroupName().trim().isEmpty())
                                ? groupDto.getGroupName() // 🔹 설정한 그룹명 사용
                                : groupDto.getDetails().get(0).getOptionName() // 🔹 없으면 첫 옵션명으로 자동 지정
                );
                group.setSalesBoard(saved);
                SalesOptionGroup savedGroup = salesOptionGroupRepository.save(group);

                // 옵션 상세 저장
                if (groupDto.getDetails() != null) {
                    groupDto.getDetails().forEach(detailDto -> {
                        SalesOptionDetail detail = new SalesOptionDetail();

                        detail.setOptionName(detailDto.getOptionName()); // 예: 중량, 구성
                        detail.setName(detailDto.getName()); // 예: 3KG, 5KG
                        detail.setPrice(detailDto.getPrice() != null ? detailDto.getPrice() : 0);
                        detail.setStock(detailDto.getStock() != null ? detailDto.getStock() : 0);
                        detail.setEnabled(detailDto.getEnabled() != null ? detailDto.getEnabled() : 1);

                        detail.setSalesOptionGroup(savedGroup);

                        salesOptionDetailRepository.save(detail);
                    });
                }

            });
        }

        // 전체 옵션 재고 합산하여 SalesBoard에 반영
        int totalStock = salesOptionDetailRepository
                .findBySalesOptionGroup_SalesBoard_NumBrd(saved.getNumBrd())
                .stream()
                .mapToInt(SalesOptionDetail::getStock)
                .sum();
        saved.setStock(totalStock);
        salesBoardRepository.save(saved);

        // ==================================================================
        // ⭐ 최종 반환: 저장된 게시글 번호
        // ==================================================================
        return saved.getNumBrd();
    }

    // 판매글 수정
    @Transactional
    public void update(int numBrd, SalesBoardCreateDTO dto) {

        SalesBoard board = salesBoardRepository.findById(numBrd)
                .orElseThrow(() -> new RuntimeException("상품 없음"));

        // 작성자 확인
        if (!board.getMember().getUserId().equals(dto.getUserId())) {
            throw new RuntimeException("권한 없음");
        }

        // 내용 수정
        board.setSubject(dto.getProductName());
        board.setContent(dto.getDescription());
        board.setPrice(dto.getPrice());
        board.setOrigin(dto.getOrigin());
        board.setProductType(dto.getProductType());
        board.setProductItem(dto.getProductItem());
        board.setStatus(dto.getStatus());

        // 3-1. 기존 이미지 삭제 // ⭐ delete() 로직 참고
        List<BoardImage> oldImages = boardImageRepository.findBySalesBoardNumBrdOrderBySortOrderDesc(numBrd);
        boardImageRepository.deleteAll(oldImages);

        // 기존 썸네일 초기화 // ⭐ 썸네일 다시 셋팅
        board.setThumbnail(null);

        // 3-2. 대표 이미지 다시 저장 (createProduct와 동일 로직) // ⭐
        if (dto.getMainImage() != null && !dto.getMainImage().isEmpty()) {
            saveBoardImage(board, dto.getMainImage(), true, 0);
        }

        // 3-3. 추가 이미지 다시 저장 (createProduct와 동일 로직) // ⭐
        if (dto.getExtraImages() != null) {
            for (int i = 0; i < dto.getExtraImages().size(); i++) {
                saveBoardImage(board, dto.getExtraImages().get(i), false, i + 1);
            }
        }

        // 4-1. 기존 옵션 삭제 (delete() 로직 재사용) // ⭐
        List<SalesOptionDetail> optionDetails = salesOptionDetailRepository
                .findBySalesOptionGroup_SalesBoard_NumBrd(numBrd);
        salesOptionDetailRepository.deleteAll(optionDetails);

        List<SalesOptionGroup> optionGroups = salesOptionGroupRepository.findBySalesBoardNumBrd(numBrd);
        salesOptionGroupRepository.deleteAll(optionGroups);

        // 4-2. 새 옵션 저장 (createProduct()의 옵션 저장 로직 복사) // ⭐
        if (dto.getOptionGroups() != null) {
            dto.getOptionGroups().forEach(groupDto -> {

                // 옵션 그룹 저장
                SalesOptionGroup group = new SalesOptionGroup();
                group.setName(
                        (groupDto.getGroupName() != null && !groupDto.getGroupName().trim().isEmpty())
                                ? groupDto.getGroupName() // 설정된 그룹명
                                : groupDto.getDetails().get(0).getOptionName() // 없으면 첫 옵션명
                );
                group.setSalesBoard(board);
                SalesOptionGroup savedGroup = salesOptionGroupRepository.save(group);

                // 옵션 상세 저장
                if (groupDto.getDetails() != null) {
                    groupDto.getDetails().forEach(detailDto -> {
                        SalesOptionDetail detail = new SalesOptionDetail();

                        detail.setOptionName(detailDto.getOptionName()); // 예: 중량, 구성
                        detail.setName(detailDto.getName()); // 예: 3KG, 5KG
                        detail.setPrice(detailDto.getPrice() != null ? detailDto.getPrice() : 0);
                        detail.setStock(detailDto.getStock() != null ? detailDto.getStock() : 0);
                        detail.setEnabled(detailDto.getEnabled() != null ? detailDto.getEnabled() : 1);

                        detail.setSalesOptionGroup(savedGroup);

                        salesOptionDetailRepository.save(detail);
                    });
                }
            });
        }

        // 옵션 상세 재고 합산 후 저장 반영
        int totalStock = salesOptionDetailRepository
                .findBySalesOptionGroup_SalesBoard_NumBrd(numBrd)
                .stream()
                .mapToInt(SalesOptionDetail::getStock)
                .sum();

        board.setStock(totalStock);
        salesBoardRepository.save(board);
    }

    // 판매 삭제
    @Transactional
    public void delete(int numBrd, String userId) {

        SalesBoard board = salesBoardRepository.findById(numBrd)
                .orElseThrow(() -> new RuntimeException("상품이 존재하지 않습니다."));

        // 권한 체크
        if (!board.getMember().getUserId().equals(userId)) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }

        // 옵션 상세 삭제 (엔티티에 salesOptionDetails 없음 리포지토리로 조회)
        List<SalesOptionDetail> optionDetails = salesOptionDetailRepository
                .findBySalesOptionGroup_SalesBoard_NumBrd(numBrd);
        salesOptionDetailRepository.deleteAll(optionDetails);

        // 옵션 그룹 삭제 (엔티티 구조에 맞게 조회 후 삭제)
        List<SalesOptionGroup> optionGroups = salesOptionGroupRepository.findBySalesBoardNumBrd(numBrd);
        salesOptionGroupRepository.deleteAll(optionGroups);

        // 이미지 삭제
        boardImageRepository.deleteAll(board.getBoardImages());

        // 리뷰 삭제
        reviewRepository.deleteAll(board.getReviews());

        // Q&A 삭제
        qnaBoardRepository.deleteAll(board.getQnaBoards());

        // 장바구니 삭제
        cartRepository.deleteAll(board.getCarts());

        // 마지막: 게시글 삭제
        salesBoardRepository.delete(board);
    }

    // 판매 상태 변경
    @Transactional
    public void updateStatus(int numBrd, String status) {
        SalesBoard board = salesBoardRepository.findById(numBrd)
                .orElseThrow(() -> new RuntimeException("상품이 존재하지 않습니다."));

        // status 값: "common" 또는 "stop"
        board.setStatus(status);
    }

    // ====================== 🔥 로컬 저장 → AWS S3 URL 저장 방식으로 변경
    // ======================
    private void saveBoardImage(SalesBoard board, String base64, boolean isThumbnail, int sortOrder) {

        try {

            if (base64.startsWith("http")) {

                BoardImage img = new BoardImage();
                img.setSalesBoard(board);
                img.setOriginalFileName("existing.png");
                img.setSaveFileName("");
                img.setPath(base64); // URL 그대로
                img.setIsThumbnail(isThumbnail ? "Y" : "N");
                img.setSortOrder(sortOrder);

                // 썸네일이면 적용
                if (isThumbnail) {
                    board.setThumbnail(base64);
                }

                boardImageRepository.save(img);
                return;
            }
            // Base64 헤더 제거
            String base64Data = base64.split(",")[1];
            byte[] bytes = Base64.getDecoder().decode(base64Data);

            // 👉 S3 에 올릴 경로 / 파일명
            String folderName = "sales/" + board.getNumBrd(); // 예) sales/16
            String fileName = System.currentTimeMillis() + "_" + sortOrder + ".png";

            // 👉 S3 업로드 + 공개 URL 얻기
            String imageUrl = s3Service.uploadFileFromBytes(bytes, folderName, fileName);

            // ⭐ 썸네일이면 SalesBoard 엔티티에도 저장!
            if (isThumbnail) {
                board.setThumbnail(imageUrl);
                salesBoardRepository.save(board);
            }

            // 👉 DB 저장 (기존 엔티티 그대로 사용)
            BoardImage img = new BoardImage();
            img.setSalesBoard(board);
            img.setOriginalFileName("uploaded.png");
            img.setSaveFileName(fileName); // 필요하면 유지 / 아니면 생략해도 됨
            img.setPath(imageUrl); // 🔥 여기: path 에 S3 전체 URL 저장
            img.setIsThumbnail(isThumbnail ? "Y" : "N");
            img.setSortOrder(sortOrder);

            boardImageRepository.save(img);

        } catch (Exception e) {
            System.out.println("🚨 Thumbnail/이미지 저장 중 오류 발생! 전체 작업 rollback");
            throw new RuntimeException("이미지 저장 실패", e);
        }
    }
    
    // 주문량 높은 순 TOP 4
    public List<SalesBoardDTO> getBestProducts() {
        return salesBoardRepository.findBestProducts().stream()
                .map(SalesBoardDTO::toDTO)
                .collect(Collectors.toList());
    }

    public List<SalesBoardDTO> getNewProducts() {
        return salesBoardRepository.findTop4ByStatusOrderByCreatedDesc("common")
                .stream()
                .map(SalesBoardDTO::toDTO)
                .collect(Collectors.toList());
    }
    
 // 🔥 인기상품 조회 (조회수 기반)
    public List<SalesBoardDTO> getPopularProducts() {
        return salesBoardRepository.findTop7ByStatusOrderByHitCountDesc("common")
                .stream()
                .map(SalesBoardDTO::toDTO)
                .collect(Collectors.toList());
    }


}