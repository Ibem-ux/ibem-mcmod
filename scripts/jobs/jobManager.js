const JOB_PROPERTY = "aegis:job";
const VALID_JOBS = ["none", "miner", "farmer", "hunter", "lumberjack"];

export function getJob(player) {
  const job = player.getDynamicProperty(JOB_PROPERTY);
  return job !== undefined && VALID_JOBS.includes(job) ? job : "none";
}

export function setJob(player, job) {
  if (!VALID_JOBS.includes(job)) {
    return false;
  }
  player.setDynamicProperty(JOB_PROPERTY, job);
  return true;
}