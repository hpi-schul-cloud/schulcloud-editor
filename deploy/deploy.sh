#! /bin/bash

# ----------------
# DECLERATIONS
# ----------------

set -e # fail with exit 1 on any error

# ----------------
# SCRIPTS
# ----------------

inform_live() {
	# $1: Project Name (client, storybook, vuepress)
	if [[ "$TRAVIS_EVENT_TYPE" != "cron" ]]
	then
	curl -X POST -H 'Content-Type: application/json' --data '{"text":":rocket: Die Produktivsysteme können aktualisiert werden: Schul-Cloud editor! Dockertag: '$DOCKERTAG'"}' $WEBHOOK_URL_CHAT
	fi
}

inform_staging() {
	if [[ "$TRAVIS_EVENT_TYPE" != "cron" ]]
	then
		curl -X POST -H 'Content-Type: application/json' --data '{"text":":boom: Das Staging-System wurde aktualisiert: Schul-Cloud editor! (Dockertag: '$DOCKERTAG')"}' $WEBHOOK_URL_CHAT
	fi
}

deploy(){
	SYSTEM=$1 # [staging, test, demo]

	DOCKER_IMAGE=$2 # (editor), autoprefixed with "schulcloud-"
	DOCKER_TAG=$3 # version/tag of the image to use. Usually the branch name or a GIT_SHA
	DOCKER_SERVICE_NAME=$4 # docker service name on server

	echo "deploy " $DOCKER_IMAGE ":" $DOCKER_TAG " to " $SYSTEM " as " $DOCKER_SERVICE_NAME

	# deploy new dockerfile
	ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i travis_rsa linux@$SYSTEM.schul-cloud.org /usr/bin/docker service update --force --image schulcloud/schulcloud-$DOCKER_IMAGE:$DOCKER_TAG $DOCKER_SERVICE_NAME
}

# ----------------
# MAIN SCRIPT
# ----------------
cd deploy

source ./buildAndDeployFilter.sh
buildAndDeployFilter

bash ./decryptSecrets.sh

echo "DOCKERTAG" $DOCKERTAG

if [ -z "$DOCKERTAG" ];
then
	echo "DOCKERTAG env is missing. Abort deployment."
	exit 1;
fi


case "$TRAVIS_BRANCH" in

	master)
		inform_live
		echo "master"
		deploy "test" "editor" $DOCKERTAG "${SYSTEM}-schul-cloud_editor"
	;;

	develop)
		echo "develop"
		# deploy $SYSTEM $DOCKERFILE $DOCKERTAG $DOCKER_SERVICENAME $COMPOSE_DUMMY $COMPOSE_FILE $COMPOSE_SERVICENAME
		deploy "test" "editor" $DOCKERTAG "test-schul-cloud_editor"
	;;
	release* | hotfix*)
		echo "release/hotfix"
		deploy "staging" "editor" $DOCKERTAG "staging_editor"
	;;
esac

exit 0
