package com.barofarm.barofarm.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.barofarm.barofarm.entity.BoardImage;

//특정상품(numBrd)의 모든 이미지(BoardImage)를 순서대로 정렬(sortOrder)해서 가져옴
//상세페이지 최상단 이미지 슬라이트에 필요한 데이터를 가져오는 메소드
public interface BoardImageRepository extends JpaRepository<BoardImage, Integer>{
	List<BoardImage> findBySalesBoardNumBrdOrderBySortOrderDesc(int numBrd);

	// 썸네일(Y) 한 개 조회하는 메소드
    BoardImage findFirstBySalesBoardNumBrdAndIsThumbnail(int numBrd, String isThumbnail);
}
