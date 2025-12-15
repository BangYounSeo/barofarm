package com.barofarm.barofarm.service;

import java.util.List;
import org.springframework.stereotype.Service;

import com.barofarm.barofarm.entity.ProductItems;
import com.barofarm.barofarm.repository.ProductItemRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductItemService {

	private final ProductItemRepository repo;

    public List<ProductItems> getItemsByCategory(int categoryCode) {
        return repo.findByCategoryCode(categoryCode);
    }
	
    public List<ProductItems> getSearchByCategory(String search) {
    	return repo.findByItemNameContaining(search);
    }
}
