SHELL := /bin/bash

DOCS_BATCH ?= $(shell date +%F)-docs-sync

.PHONY: docs\:bootstrap docs\:validate docs\:build docs\:sync-report

docs\:bootstrap:
	DOCS_BATCH=$(DOCS_BATCH) bash scripts/docs/bootstrap_docx_validator.sh

docs\:validate:
	DOCS_BATCH=$(DOCS_BATCH) bash scripts/docs/validate_docx.sh

docs\:build:
	DOCS_BATCH=$(DOCS_BATCH) bash scripts/docs/build_docx.sh
	DOCS_BATCH=$(DOCS_BATCH) bash scripts/docs/build_pdfs.sh

docs\:sync-report:
	DOCS_BATCH=$(DOCS_BATCH) bash scripts/docs/check_consistency.sh
	DOCS_BATCH=$(DOCS_BATCH) bash scripts/docs/sync_report.sh
