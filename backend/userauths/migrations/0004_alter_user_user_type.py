# Generated by Django 5.1.4 on 2025-01-21 20:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('userauths', '0003_remove_profile_full_name_alter_user_first_name_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='user_type',
            field=models.CharField(choices=[('admin', 'Admin'), ('student', 'Student')], default='admin', max_length=10),
        ),
    ]
