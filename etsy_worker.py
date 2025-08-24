
def queue_draft(payload):
    # stub: write to a local queue file for audit. In production, send to Playwright worker or message queue.
    with open('queued_drafts.json','a') as f:
        f.write(str(payload) + '\n')
    return True
