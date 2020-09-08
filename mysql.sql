/*==============================================================*/
/* DBMS name:      MySQL 5.0                                    */
/* Created on:     2020/8/24 16:51:33                           */
/*==============================================================*/

drop table if exists house;
drop table if exists demand;
drop table if exists trust;
drop table if exists trustdemand;


/*==============================================================*/
/* Table: demand                                                */
/*==============================================================*/
create table demand
(
   demandid             int not null auto_increment,
   demand_title			varchar(255),
   demand_address		varchar(255),
   publisher_uid        int,
   publish_time         datetime,  
   price_monthly        decimal(10,2),
   demand_detail        varchar(2560),
   area					varchar(255),
   layout				varchar(255),
   primary key (demandid)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_bin;

alter table demand comment '求租表';

/*==============================================================*/
/* Index: demand_publisherid_index                              */
/*==============================================================*/
create index demand_publisherid_index on demand
(
   publisher_uid
);

/*==============================================================*/
/* Table: house                                                 */
/*==============================================================*/
create table house
(
   houseid              int not null auto_increment,
   publisher_uid         int,
   publish_time         datetime,
   price_monthly        decimal(10,2),
   house_address        varchar(255),
   house_detail         varchar(2560),
   imglist              varchar(2560),
   taglist              varchar(255),
   area				varchar(255),
   layout				varchar(255),
   primary key (houseid)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_bin;

alter table house comment '房屋出租表';

/*==============================================================*/
/* Index: house_pubisherid_index                                */
/*==============================================================*/
create index house_pubisherid_index on house
(
   publisher_uid
);

/*==============================================================*/
/* Table: trust                                                 */
/*==============================================================*/
create table trust
(
   trustid              int not null auto_increment,
   trust_title			varchar(255),
   trust_address		varchar(255),
   publisher_uid         int,
   publish_time         datetime,
   min_age			int,
   max_age				int,
   edu_service			varchar(255),
   food_service			varchar(255),
   price_monthly        decimal(10,2),
   trust_detail         varchar(2560),
   imglist				varchar(2560),
   primary key (trustid)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_bin;

alter table trust comment '托管表';

/*==============================================================*/
/* Index: trust_publisherid_index                               */
/*==============================================================*/
create index trust_publisherid_index on trust
(
   publisher_uid
);
/*==============================================================*/
/* Table: trustdemand                                                 */
/*==============================================================*/
create table trustdemand
(
   trustdemandid        int not null auto_increment,
   trustdemand_title	varchar(255),
   trustdemand_address	varchar(255),
   trustdemand_time		varchar(255),
   publisher_uid        int,
   publish_time         datetime,
   edu_service			varchar(255),
   food_service			varchar(255),
   price_monthly        decimal(10,2),
   childage				varchar(10),
   trustdemand_detail   varchar(2560), 
   primary key (trustdemandid)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_bin;

alter table trustdemand comment '托管需求表';

/*==============================================================*/
/* Index: trustdemand_publisherid_index                               */
/*==============================================================*/
create index trustdemand_publisherid_index on trustdemand
(
   publisher_uid
);

/*==============================================================*/
/* Table: user                                                  */
/*==============================================================*/
create table user
(
   uid                  int not null auto_increment,
   phone                char(22) not null,
   username             varchar(255),
   password             varchar(255) not null,
   account_state        char(255),
   primary key (uid),
   unique key AK_user_phoneKey (phone)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_bin;

alter table user comment '用户表';

/*==============================================================*/
/* Index: phone_index                                           */
/*==============================================================*/
create unique index phone_index on user
(
   phone
);

alter table demand add constraint FK_Reference_2 foreign key (publisher_uid)
      references user (uid) on delete restrict on update restrict;

alter table house add constraint FK_Reference_1 foreign key (publisher_uid)
      references user (uid) on delete restrict on update restrict;

alter table trust add constraint FK_Reference_3 foreign key (publisher_uid)
      references user (uid) on delete restrict on update restrict;
	  
alter table trustdemand add constraint FK_Reference_4 foreign key (publisher_uid)
      references user (uid) on delete restrict on update restrict;

