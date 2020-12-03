package com.herokuapp.projectideas.database.document;

import java.time.Instant;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonView;
import com.herokuapp.projectideas.database.View;

import lombok.*;

@NoArgsConstructor
@Getter
@Setter
public class User {

    private String id;
    @JsonView(View.Base.class)
    private String username;
    @JsonView(View.Base.class)
    private String email;
    @JsonView(View.Get.class)
    private long timeCreated;
    @JsonView(View.Get.class)
    private boolean admin;

    public User(String username, String email) {
        this.id = UUID.randomUUID().toString();
        this.username = username;
        this.email = email;
        this.timeCreated = Instant.now().getEpochSecond();
        this.admin = false;
    }
}
