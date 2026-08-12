package dev.ostra.projetoostra.catalog.collection;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/collections")
public class JewelryCollectionController {

    private final JewelryCollectionService service;

    public JewelryCollectionController(JewelryCollectionService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<JewelryCollectionResponseDTO> create(@RequestBody @Valid JewelryCollectionRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @GetMapping
    public ResponseEntity<List<JewelryCollectionResponseDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JewelryCollectionResponseDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JewelryCollectionResponseDTO> update(@PathVariable UUID id, @RequestBody @Valid JewelryCollectionRequestDTO request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}