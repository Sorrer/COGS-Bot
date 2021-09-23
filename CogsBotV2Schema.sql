-- MySQL dump 10.13  Distrib 8.0.21, for Win64 (x86_64)
--
-- Host: 192.168.0.195    Database: cogsevents
-- ------------------------------------------------------
-- Server version	8.0.22-0ubuntu0.20.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `cogsevents`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `cogsevents` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `cogsevents`;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `serverid` int unsigned NOT NULL,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`,`serverid`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `fk_cogsevents_cogs_server_id_idx` (`serverid`),
  CONSTRAINT `fk_cogsevents_cogs_server_id` FOREIGN KEY (`serverid`) REFERENCES `cogs`.`servers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `groupchannels`
--

DROP TABLE IF EXISTS `groupchannels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `groupchannels` (
  `eventid` int unsigned NOT NULL,
  `channelid` bigint unsigned NOT NULL,
  `channeltype` varchar(45) NOT NULL,
  PRIMARY KEY (`eventid`,`channelid`),
  KEY `fk_cogsevents_groupchannels_events_eventid_idx` (`eventid`),
  CONSTRAINT `fk_cogsevents_groupchannels_events_eventid` FOREIGN KEY (`eventid`) REFERENCES `events` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `groupmembers`
--

DROP TABLE IF EXISTS `groupmembers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `groupmembers` (
  `eventid` int unsigned NOT NULL,
  `channelid` bigint unsigned NOT NULL,
  `userid` bigint unsigned NOT NULL,
  PRIMARY KEY (`eventid`,`channelid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `groups`
--

DROP TABLE IF EXISTS `groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `groups` (
  `eventid` int unsigned NOT NULL,
  `groupid` int unsigned NOT NULL,
  `textchannelid` bigint unsigned NOT NULL,
  `voicechannelid` bigint unsigned NOT NULL,
  PRIMARY KEY (`eventid`,`groupid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'cogsevents'
--

--
-- Current Database: `cogsprojects`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `cogsprojects` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `cogsprojects`;

--
-- Table structure for table `channels`
--

DROP TABLE IF EXISTS `channels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `channels` (
  `serverid` int unsigned NOT NULL,
  `projectid` int unsigned NOT NULL,
  `channelid` bigint unsigned NOT NULL,
  `channeltype` varchar(20) NOT NULL,
  PRIMARY KEY (`serverid`,`projectid`,`channelid`),
  KEY `foreign projectid_idx` (`projectid`),
  CONSTRAINT `fk_cogsprojects_channels_projects_serverid` FOREIGN KEY (`serverid`, `projectid`) REFERENCES `projects` (`serverid`, `projectid`),
  CONSTRAINT `projectchannel projectid foreign` FOREIGN KEY (`projectid`) REFERENCES `projects` (`projectid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `listings`
--

DROP TABLE IF EXISTS `listings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listings` (
  `projectid` int unsigned NOT NULL,
  `serverid` int unsigned NOT NULL,
  `messageid` bigint unsigned NOT NULL,
  PRIMARY KEY (`projectid`,`serverid`),
  KEY `fk_cogsprojects_listings_projects_serverid_idx` (`serverid`),
  CONSTRAINT `fk_cogsprojects_listings_projects_projectid` FOREIGN KEY (`projectid`) REFERENCES `projects` (`projectid`),
  CONSTRAINT `fk_cogsprojects_listings_projects_serverid` FOREIGN KEY (`serverid`) REFERENCES `projects` (`serverid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `members` (
  `serverid` int unsigned NOT NULL,
  `projectid` int unsigned NOT NULL,
  `memberid` bigint unsigned NOT NULL,
  KEY `foreign projectid_idx` (`projectid`),
  KEY `fk_cogsprojects_lmembers_projects_serverid_idx` (`serverid`,`projectid`),
  CONSTRAINT `fk_cogsprojects_lmembers_projects_serverid` FOREIGN KEY (`serverid`, `projectid`) REFERENCES `projects` (`serverid`, `projectid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `projectid` int unsigned NOT NULL AUTO_INCREMENT,
  `serverid` int unsigned NOT NULL,
  `ownerid` bigint unsigned NOT NULL,
  `title` blob NOT NULL,
  `description` blob NOT NULL,
  `textchannelid` bigint unsigned NOT NULL,
  `voicechannelid` bigint unsigned NOT NULL,
  `categoryid` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`projectid`,`serverid`),
  UNIQUE KEY `projectid_UNIQUE` (`projectid`),
  UNIQUE KEY `categoryid_UNIQUE` (`categoryid`),
  KEY `foreign serverid_idx` (`serverid`),
  CONSTRAINT `foreign serverid` FOREIGN KEY (`serverid`) REFERENCES `cogs`.`servers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'cogsprojects'
--

--
-- Current Database: `cogs`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `cogs` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `cogs`;

--
-- Table structure for table `serverchannels`
--

DROP TABLE IF EXISTS `serverchannels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `serverchannels` (
  `serverid` int unsigned NOT NULL,
  `channelid` bigint unsigned NOT NULL,
  `tag` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`serverid`,`channelid`),
  CONSTRAINT `fk_cogs_serverchannels_server_id` FOREIGN KEY (`serverid`) REFERENCES `servers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `serverprefixes`
--

DROP TABLE IF EXISTS `serverprefixes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `serverprefixes` (
  `serverid` int unsigned NOT NULL,
  `prefix` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`serverid`),
  UNIQUE KEY `serverid_UNIQUE` (`serverid`),
  CONSTRAINT `fk_cogs_serverprefixes_servers_id` FOREIGN KEY (`serverid`) REFERENCES `servers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `serverroles`
--

DROP TABLE IF EXISTS `serverroles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `serverroles` (
  `serverid` int unsigned NOT NULL,
  `roleid` bigint unsigned NOT NULL,
  `privilege` int NOT NULL,
  PRIMARY KEY (`serverid`,`roleid`),
  UNIQUE KEY `id_UNIQUE` (`serverid`),
  CONSTRAINT `fk_cogs_serverroles_server_id` FOREIGN KEY (`serverid`) REFERENCES `servers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `servers`
--

DROP TABLE IF EXISTS `servers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servers` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `guild` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `guild_UNIQUE` (`guild`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `serversettings`
--

DROP TABLE IF EXISTS `serversettings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `serversettings` (
  `serverid` int unsigned NOT NULL,
  `setting` varchar(45) NOT NULL,
  `value` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`serverid`,`setting`),
  CONSTRAINT `fk_cogs_serversettings_servers_id` FOREIGN KEY (`serverid`) REFERENCES `servers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `verified`
--

DROP TABLE IF EXISTS `verified`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `verified` (
  `userid` bigint unsigned NOT NULL,
  `netid` blob NOT NULL,
  PRIMARY KEY (`userid`),
  UNIQUE KEY `userid_UNIQUE` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `verifying`
--

DROP TABLE IF EXISTS `verifying`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `verifying` (
  `userid` bigint unsigned NOT NULL,
  `code` varchar(6) NOT NULL,
  `netid` blob NOT NULL,
  `tries` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`userid`),
  UNIQUE KEY `userid_UNIQUE` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'cogs'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-01-27 17:35:23
