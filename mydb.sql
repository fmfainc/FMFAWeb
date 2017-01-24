-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';
SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`locations`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`locations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `location_name` VARCHAR(255) NULL,
  `location_description` VARCHAR(5000) NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`categories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `category_name` VARCHAR(255) NULL,
  `category_description` VARCHAR(5000) NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`class_descriptions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`class_descriptions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `class_name` VARCHAR(255) NULL,
  `categories_id` INT NOT NULL,
  `class_description` VARCHAR(5000) NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`, `categories_id`),
  INDEX `fk_class_descriptions_categories1_idx` (`categories_id` ASC),
  CONSTRAINT `fk_class_descriptions_categories1`
    FOREIGN KEY (`categories_id`)
    REFERENCES `mydb`.`categories` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`class_instances`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`class_instances` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `locations_id` INT NOT NULL,
  `class_descriptions_id` INT NOT NULL,
  `start_date` DATETIME NULL,
  `end_date` DATETIME NULL,
  `min_students` INT NULL,
  `max_students` INT NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`, `locations_id`, `class_descriptions_id`),
  INDEX `fk_class_instances_locations1_idx` (`locations_id` ASC),
  INDEX `fk_class_instances_class_descriptions1_idx` (`class_descriptions_id` ASC),
  CONSTRAINT `fk_class_instances_locations1`
    FOREIGN KEY (`locations_id`)
    REFERENCES `mydb`.`locations` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_class_instances_class_descriptions1`
    FOREIGN KEY (`class_descriptions_id`)
    REFERENCES `mydb`.`class_descriptions` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`students`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`students` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(255) NULL,
  `last_name` VARCHAR(255) NULL,
  `email` VARCHAR(45) NULL,
  `phone` VARCHAR(45) NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`classes_has_students`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`classes_has_students` (
  `class_instance_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `register_date` DATETIME NULL,
  `waitlisted` TINYINT(1) NULL,
  PRIMARY KEY (`class_instance_id`, `student_id`),
  INDEX `fk_classes_has_students_students1_idx` (`student_id` ASC),
  INDEX `fk_classes_has_students_classes_idx` (`class_instance_id` ASC),
  CONSTRAINT `fk_classes_has_students_classes`
    FOREIGN KEY (`class_instance_id`)
    REFERENCES `mydb`.`class_instances` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_classes_has_students_students1`
    FOREIGN KEY (`student_id`)
    REFERENCES `mydb`.`students` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`waitlist`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`waitlist` (
  `classes_id` INT NOT NULL,
  `students_id` INT NOT NULL,
  PRIMARY KEY (`classes_id`, `students_id`),
  INDEX `fk_classes_has_students1_students1_idx` (`students_id` ASC),
  INDEX `fk_classes_has_students1_classes1_idx` (`classes_id` ASC),
  CONSTRAINT `fk_classes_has_students1_classes1`
    FOREIGN KEY (`classes_id`)
    REFERENCES `mydb`.`class_instances` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_classes_has_students1_students1`
    FOREIGN KEY (`students_id`)
    REFERENCES `mydb`.`students` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`locations`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`locations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `location_name` VARCHAR(255) NULL,
  `location_description` VARCHAR(5000) NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`admin_logins`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`admin_logins` (
  `id` INT NOT NULL DEFAULT 1,
  `username` VARCHAR(255) NULL DEFAULT 'admin',
  `password` VARCHAR(255) NULL DEFAULT '$2a$10$F0gx/AuhSoT0Dc2qbxw/GOf40kKXV6P3jyLvfex.ReXUov7tfNrCS',
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
