# Generated by Django 5.1.7 on 2025-03-14 06:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0008_course_image'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='course',
            options={'ordering': ['-created_at']},
        ),
        migrations.AlterField(
            model_name='course',
            name='created_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
