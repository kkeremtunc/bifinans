# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Asset(models.Model):
    id = models.TextField(primary_key=True)
    userid = models.ForeignKey('User', models.DB_CASCADE, db_column='userId')  # Field name made lowercase.
    assettype = models.TextField(db_column='assetType')  # Field name made lowercase.
    symbol = models.TextField()
    amount = models.FloatField()
    averagecost = models.FloatField(db_column='averageCost')  # Field name made lowercase.
    currentprice = models.FloatField(db_column='currentPrice')  # Field name made lowercase.
    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.
    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Asset'


class Auditlog(models.Model):
    id = models.TextField(primary_key=True)
    userid = models.ForeignKey('User', models.DB_SET_NULL, db_column='userId', blank=True, null=True)  # Field name made lowercase.
    action = models.TextField()
    targetentity = models.TextField(db_column='targetEntity')  # Field name made lowercase.
    targetid = models.TextField(db_column='targetId', blank=True, null=True)  # Field name made lowercase.
    ipaddress = models.TextField(db_column='ipAddress')  # Field name made lowercase.
    useragent = models.TextField(db_column='userAgent')  # Field name made lowercase.
    details = models.TextField(blank=True, null=True)
    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'AuditLog'


class Budgettransaction(models.Model):
    id = models.TextField(primary_key=True)
    userid = models.ForeignKey('User', models.DB_CASCADE, db_column='userId')  # Field name made lowercase.
    type = models.TextField()
    category = models.TextField()
    amount = models.FloatField()
    description = models.TextField()
    date = models.DateTimeField()
    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.
    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'BudgetTransaction'


class Contentitem(models.Model):
    id = models.TextField(primary_key=True)
    authorid = models.ForeignKey('User', models.DO_NOTHING, db_column='authorId')  # Field name made lowercase.
    title = models.TextField()
    summary = models.TextField()
    content = models.TextField()
    category = models.TextField()
    isapproved = models.BooleanField(db_column='isApproved')  # Field name made lowercase.
    approvedbyid = models.ForeignKey('User', models.DB_SET_NULL, db_column='approvedById', related_name='contentitem_approvedbyid_set', blank=True, null=True)  # Field name made lowercase.
    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.
    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'ContentItem'


class Refreshtoken(models.Model):
    id = models.TextField(primary_key=True)
    userid = models.ForeignKey('User', models.DB_CASCADE, db_column='userId')  # Field name made lowercase.
    token = models.TextField(unique=True)
    expiresat = models.DateTimeField(db_column='expiresAt')  # Field name made lowercase.
    revokedat = models.DateTimeField(db_column='revokedAt', blank=True, null=True)  # Field name made lowercase.
    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'RefreshToken'


class Supportticket(models.Model):
    id = models.TextField(primary_key=True)
    userid = models.ForeignKey('User', models.DB_CASCADE, db_column='userId')  # Field name made lowercase.
    subject = models.TextField()
    message = models.TextField()
    category = models.TextField()
    status = models.TextField()
    response = models.TextField(blank=True, null=True)
    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.
    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'SupportTicket'


class User(models.Model):
    id = models.TextField(primary_key=True)
    email = models.TextField(unique=True)
    passwordhash = models.TextField(db_column='passwordHash')  # Field name made lowercase.
    name = models.TextField()
    surname = models.TextField()
    role = models.TextField()
    status = models.TextField()
    createdat = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.
    updatedat = models.DateTimeField(db_column='updatedAt')  # Field name made lowercase.
    disclaimeraccepted = models.BooleanField(db_column='disclaimerAccepted')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'User'


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)
    name = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()
    first_name = models.CharField(max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class DjangoAdminLog(models.Model):
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.PositiveSmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    action_time = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'
