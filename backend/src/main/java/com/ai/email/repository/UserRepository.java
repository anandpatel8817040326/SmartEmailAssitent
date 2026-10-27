package com.ai.email.repository;

import com.ai.email.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByContactNumber(String contactNumber);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByContactNumber(String contactNumber);
}
