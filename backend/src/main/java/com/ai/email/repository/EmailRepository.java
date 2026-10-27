package com.ai.email.repository;

import com.ai.email.model.EmailDraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailRepository extends JpaRepository<EmailDraft, Long> {
    List<EmailDraft> findAllByOrderByCreatedAtDesc();
}
