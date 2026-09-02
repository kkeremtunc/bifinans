from django.contrib import admin
from .models import User, Asset, Auditlog, Budgettransaction, Contentitem, Supportticket

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'email', 'name', 'surname', 'role', 'status', 'createdat', 'disclaimeraccepted')
    search_fields = ('email', 'name', 'surname')
    list_filter = ('role', 'status', 'disclaimeraccepted')

@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('id', 'userid', 'assettype', 'symbol', 'amount', 'currentprice')
    list_filter = ('assettype',)
    search_fields = ('symbol', 'userid__email')

@admin.register(Auditlog)
class AuditlogAdmin(admin.ModelAdmin):
    list_display = ('id', 'userid', 'action', 'targetentity', 'createdat')
    list_filter = ('action', 'targetentity')

@admin.register(Budgettransaction)
class BudgettransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'userid', 'type', 'category', 'amount', 'date')
    list_filter = ('type', 'category')

@admin.register(Contentitem)
class ContentitemAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'category', 'isapproved', 'createdat')
    list_filter = ('category', 'isapproved')

@admin.register(Supportticket)
class SupportticketAdmin(admin.ModelAdmin):
    list_display = ('id', 'userid', 'subject', 'category', 'status', 'createdat')
    list_filter = ('category', 'status')
