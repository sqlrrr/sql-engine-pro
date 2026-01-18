CREATE TABLE `exchange_api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exchange` varchar(50) NOT NULL,
	`apiKey` text NOT NULL,
	`secretKey` text NOT NULL,
	`passphrase` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exchange_api_keys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `market_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`price` decimal(20,8) NOT NULL,
	`volume` decimal(20,8),
	`bid` decimal(20,8),
	`ask` decimal(20,8),
	`change24h` decimal(5,2),
	`marketCap` decimal(20,2),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `market_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`source` varchar(100) NOT NULL,
	`sentiment` enum('POSITIVE','NEGATIVE','NEUTRAL') NOT NULL,
	`url` text,
	`importance` enum('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT 'MEDIUM',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `news_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `on_chain_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`blockchain` varchar(50) NOT NULL,
	`exchangeInflow` decimal(20,8),
	`exchangeOutflow` decimal(20,8),
	`whaleMovements` int,
	`stablecoinInflow` decimal(20,8),
	`stablecoinOutflow` decimal(20,8),
	`activeAddresses` int,
	`transactionVolume` decimal(20,8),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `on_chain_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_sentiment` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`source` enum('TWITTER','TELEGRAM','DISCORD','REDDIT') NOT NULL,
	`sentimentScore` decimal(5,2) NOT NULL,
	`bullishCount` int,
	`bearishCount` int,
	`neutralCount` int,
	`volume` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `social_sentiment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trade_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`side` enum('BUY','SELL') NOT NULL,
	`quantity` decimal(20,8) NOT NULL,
	`price` decimal(20,8) NOT NULL,
	`totalValue` decimal(20,2) NOT NULL,
	`leverage` decimal(3,1) DEFAULT '1.0',
	`stopLoss` decimal(20,8),
	`takeProfit` decimal(20,8),
	`status` enum('OPEN','CLOSED','CANCELLED') NOT NULL,
	`pnl` decimal(20,2),
	`exchange` varchar(50) NOT NULL,
	`orderId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`closedAt` timestamp,
	CONSTRAINT `trade_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trading_signals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`action` enum('BUY','SELL','HOLD') NOT NULL,
	`confidence` decimal(3,2) NOT NULL,
	`score` decimal(5,2) NOT NULL,
	`technicalScore` decimal(5,2),
	`onChainScore` decimal(5,2),
	`sentimentScore` decimal(5,2),
	`macroScore` decimal(5,2),
	`reasoning` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trading_signals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`riskProfile` enum('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'MEDIUM',
	`autoTradingEnabled` boolean NOT NULL DEFAULT false,
	`maxLeverage` decimal(3,1) NOT NULL DEFAULT '1.0',
	`maxDailyLoss` decimal(5,2),
	`watchlistSymbols` text,
	`notificationsEnabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whale_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletAddress` varchar(255) NOT NULL,
	`tokenAddress` varchar(255) NOT NULL,
	`amount` decimal(20,8) NOT NULL,
	`usdValue` decimal(20,2),
	`transactionHash` varchar(255),
	`alertType` enum('LARGE_BUY','LARGE_SELL','EXCHANGE_INFLOW','EXCHANGE_OUTFLOW') NOT NULL,
	`blockchain` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whale_alerts_id` PRIMARY KEY(`id`)
);
