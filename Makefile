SHELL := /bin/bash

DOCS_BATCH ?= $(shell date +%F)-docs-sync
FORMAL_BATCH ?= $(shell date +%F)-formal-exp
FORMAL_STAGE ?= all
FORMAL_BENCHMARK ?= data/training/eval/benchmark_formal_v1.jsonl
FORMAL_PRESET ?= A
FORMAL_SEED ?= 42

.PHONY: docs\:bootstrap docs\:validate docs\:build docs\:sync-report
.PHONY: train\:formal-assets train\:formal-stage train\:formal-finalize

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

train\:formal-assets:
	bash scripts/ai/prepare_formal_assets.sh

train\:formal-stage:
	bash scripts/ai/run_formal_stage.sh \
		--batch "$(FORMAL_BATCH)" \
		--stage "$(FORMAL_STAGE)" \
		--benchmark-file "$(FORMAL_BENCHMARK)" \
		--preset "$(FORMAL_PRESET)" \
		--seed "$(FORMAL_SEED)"

train\:formal-finalize:
	bash scripts/ai/finalize_formal_batch.sh "$(FORMAL_BATCH)" --stage "$(FORMAL_STAGE)"
