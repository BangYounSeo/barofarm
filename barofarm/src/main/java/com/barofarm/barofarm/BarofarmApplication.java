//barofarmApplication.java
package com.barofarm.barofarm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;



@SpringBootApplication
@EnableScheduling
public class BarofarmApplication {

    public static void main(String[] args) {
        SpringApplication.run(BarofarmApplication.class, args);
    }
}
